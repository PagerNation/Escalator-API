import Joi from 'joi';
import _ from 'lodash';
import scheduler from 'node-schedule';
import JoiHelper from '../helpers/JoiHelper';
import Group from '../models/group';
import userService from './user';

const ID_SCHEMA = Joi.string().hex().length(24);

function getGroup(groupName) {
  return Group.get(groupName);
}

function getAllGroups() {
  return Group.getAllGroups();
}

function deleteGroup(groupName) {
  return Group.delete(groupName);
}

function createGroup(groupObject) {
  const groupSchema = Joi.object().keys({
    name: Joi.string().required(),
    users: Joi.array().items(ID_SCHEMA),
    escalationPolicy: Joi.object(),
    admins: Joi.array().items(ID_SCHEMA),
    joinRequests: Joi.array().items(ID_SCHEMA),
    lastRotated: Joi.date()
  });

  return JoiHelper.validate(groupObject, groupSchema)
    .then(validatedGroupObject => Group.create(validatedGroupObject))
    .then(createdGroup => scheduleEPRotation(createdGroup))
    .then(ro => ro.group);
}

function updateGroup(groupName, groupUpdates) {
  const groupSchema = Joi.object().keys({
    name: Joi.string(),
    users: Joi.array().items(ID_SCHEMA),
    lastRotated: Joi.date()
  });

  return JoiHelper.validate(groupUpdates, groupSchema)
    .then(validatedGroupObject =>
      Group.findOneAndUpdate({ name: groupName }, validatedGroupObject, { new: true }));
}

function addUser(group, userId) {
  let tmpGroup;

  return userService.exists(userId)
    .then(() => JoiHelper.validate(userId, ID_SCHEMA))
    .then(validatedUserObject => group.addUser(validatedUserObject))
    .then((updatedGroup) => {
      tmpGroup = updatedGroup;
      return userService.addGroupByUserId(userId, updatedGroup.name);
    })
    .then(() => tmpGroup);
}

function removeUser(group, userId) {
  return JoiHelper.validate(userId, ID_SCHEMA)
    .then((validatedUserId) => {
      const removeUserFromGroup = group.removeUser(validatedUserId);
      const removeGroupFromUser = userService.removeGroupByUserId(validatedUserId, group.name);
      return Promise.all([removeUserFromGroup, removeGroupFromUser]);
    })
    .then(promiseResults => promiseResults[0]);
}

function makeJoinRequest(groupName, userId) {
  return userService.exists(userId)
    .then(() => JoiHelper.validate(userId, ID_SCHEMA))
    .then(id => Group.makeJoinRequest(groupName, id));
}

function processJoinRequest(group, userId, isAccepted) {
  const schema = Joi.object().keys({
    userId: ID_SCHEMA.required(),
    isAccepted: Joi.boolean().required()
  });

  return JoiHelper.validate({ userId, isAccepted }, schema)
    .then(v => group.processJoinRequest(v.userId, v.isAccepted));
}

function searchByName(partialGroupName) {
  return Group.searchByName(partialGroupName);
}

function updateEscalationPolicy(groupName, escalationPolicy) {
  const escalationPolicySchema = Joi.object().keys({
    rotationIntervalInDays: Joi.number(),
    pagingIntervalInMinutes: Joi.number(),
    subscribers: Joi.array().items(ID_SCHEMA)
  });

  return JoiHelper.validate(escalationPolicy, escalationPolicySchema)
    .then((validatedEscalationPolicy) => {
      const updates = {};

      _.each(validatedEscalationPolicy, (value, key) => {
        updates[`escalationPolicy.${key}`] = value;
      });

      return Group.updateEscalationPolicy(groupName, updates);
    });
}

function addAdmin(groupName, userId) {
  return userService.exists(userId)
    .then(() => JoiHelper.validate(userId, ID_SCHEMA))
    .then(validatedUserId => Group.addAdmin(groupName, validatedUserId));
}

function scheduleEPRotation(group) {
  const rotationInterval = group.escalationPolicy.rotationIntervalInDays;
  const nextRotateDate = buildRotateDate(group.lastRotated, rotationInterval);
  scheduler.scheduleJob(nextRotateDate, rotateEscalationPolicy.bind(null, group));
  return Promise.resolve({ nextRotateDate, group });
}

function rotateEscalationPolicy(group) {
  let subscribers = group.escalationPolicy.subscribers;
  subscribers.push(subscribers.shift());
  subscribers = subscribers.map(s => s.toString());
  const groupUpdates = { lastRotated: new Date() };
  return scheduleEPRotation(group)
    .then(() => updateGroup(group.name, groupUpdates))
    .then(() => updateEscalationPolicy(group.name, { subscribers }));
}

// Internal Helper Function
function buildRotateDate(currentDate, rotationInterval) {
  const nextRotateDate = new Date(currentDate);
  nextRotateDate.setDate(nextRotateDate.getDate() + rotationInterval);
  nextRotateDate.setHours(23);
  nextRotateDate.setMinutes(59);
  nextRotateDate.setSeconds(0);
  return nextRotateDate;
}

export default {
  // Group CRUD
  getGroup,
  getAllGroups,
  deleteGroup,
  createGroup,
  updateGroup,
  searchByName,
  addAdmin,
  makeJoinRequest,
  processJoinRequest,
  // Group User Modifications
  addUser,
  removeUser,
  // Escalation Policy Modifications
  updateEscalationPolicy,
  scheduleEPRotation,
  rotateEscalationPolicy
};
