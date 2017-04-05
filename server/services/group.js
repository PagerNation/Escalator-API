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

function getGroups(query) {
  return Group.getGroups(query);
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
    .then(promiseResults => Group.removeUserFromEscalationPolicy(promiseResults[0].name, userId))
    .then(g => removeAdmin(g.name, userId));
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
    subscribers: Joi.array().items(Joi.object().keys({
      userId: ID_SCHEMA,
      active: Joi.boolean(),
      deactivateDate: Joi.any().allow(Joi.date(), null),
      reactivateDate: Joi.any().allow(Joi.date(), null)
    }))
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

function removeAdmin(groupName, userId) {
  return userService.exists(userId)
    .then(() => JoiHelper.validate(userId, ID_SCHEMA))
    .then(validatedUserId => Group.removeAdmin(groupName, validatedUserId));
}

function scheduleEPRotation(group) {
  const rotationInterval = group.escalationPolicy.rotationIntervalInDays;
  const nextRotateDate = buildRotateDate(group.lastRotated, rotationInterval);
  scheduler.scheduleJob(nextRotateDate, rotateEscalationPolicy.bind(null, group));
  return Promise.resolve({ nextRotateDate, group });
}

function rotateEscalationPolicy(group) {
  const subscribers = group.escalationPolicy.subscribers;
  subscribers.push(subscribers.shift());
  const groupUpdates = { lastRotated: new Date() };
  return scheduleEPRotation(group)
    .then(() => updateGroup(group.name, groupUpdates))
    .then(() => updateEscalationPolicy(group.name, { subscribers: morphSubscribers(subscribers) }));
}

function scheduleDeactivateUser(group, userId, deactivateDate, reactivateDate) {
  const subscribers = group.escalationPolicy.subscribers;
  const subscriberToOverride = _.find(subscribers, s => s.userId.toString() === userId.toString());
  subscriberToOverride.deactivateDate = deactivateDate;
  subscriberToOverride.reactivateDate = reactivateDate;

  return updateEscalationPolicy(group.name, { subscribers: morphSubscribers(subscribers) })
    .then((updatedGroup) => {
      if (deactivateDate <= new Date()) {
        return deactivateUser(updatedGroup, userId, reactivateDate);
      }
      scheduler.scheduleJob(deactivateDate,
                            deactivateUser.bind(null, updatedGroup, userId, reactivateDate));
      return updatedGroup;
    })
    .then(gWithDeactivatedUser => ({ deactivateDate, group: gWithDeactivatedUser }));
}

function scheduleReactivateUser(group, userId) {
  const subscribers = group.escalationPolicy.subscribers;
  const toReactivate = _.find(subscribers, s => s.userId.toString() === userId.toString());
  const reactivateDate = toReactivate.reactivateDate;

  if (reactivateDate <= new Date()) {
    return reactivateUser(group, userId)
      .then(updatedGroup => Promise.resolve({ reactivateDate, group: updatedGroup }));
  }
  scheduler.scheduleJob(reactivateDate,
                        reactivateUser.bind(null, group, userId));
  return Promise.resolve({ reactivateDate, group });
}

function deactivateUser(group, userId) {
  const subscribers = group.escalationPolicy.subscribers;
  const userToDeactivate = _.find(subscribers, s => s.userId.toString() === userId.toString());
  userToDeactivate.active = false;
  userToDeactivate.deactivateDate = null;
  return updateEscalationPolicy(group.name, { subscribers: morphSubscribers(subscribers) })
    .then(updatedGroup => scheduleReactivateUser(updatedGroup, userId))
    .then(returnObj => returnObj.group);
}

function reactivateUser(group, userId) {
  const subscribers = group.escalationPolicy.subscribers;
  const userToReactivate = _.find(subscribers, s => s.userId.toString() === userId.toString());
  userToReactivate.active = true;
  userToReactivate.reactivateDate = null;

  return updateEscalationPolicy(group.name, { subscribers: morphSubscribers(subscribers) });
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

function morphSubscribers(subscribersArr) {
  const subscribers = subscribersArr;
  for (let i = 0; i < subscribers.length; i++) {
    const s = {};
    s.userId = subscribers[i].userId.toString();
    s.active = subscribers[i].active;
    s.deactivateDate = subscribers[i].deactivateDate;
    s.reactivateDate = subscribers[i].reactivateDate;
    subscribers[i] = s;
  }
  return subscribers;
}

export default {
  // Group CRUD
  getGroup,
  getAllGroups,
  getGroups,
  deleteGroup,
  createGroup,
  updateGroup,
  searchByName,
  addAdmin,
  removeAdmin,
  makeJoinRequest,
  processJoinRequest,
  // Group User Modifications
  addUser,
  removeUser,
  // Escalation Policy Modifications
  updateEscalationPolicy,
  scheduleEPRotation,
  rotateEscalationPolicy,
  scheduleDeactivateUser,
  scheduleReactivateUser,
  deactivateUser,
  reactivateUser
};
