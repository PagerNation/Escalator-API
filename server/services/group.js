import Joi from 'joi';
import _ from 'lodash';
import JoiHelper from '../helpers/JoiHelper';
import Group from '../models/group';
import userService from './user';

function getGroup(groupName) {
  return Group.get(groupName);
}

function deleteGroup(groupName) {
  return Group.delete(groupName);
}

function createGroup(groupObject) {
  const groupSchema = Joi.object().keys({
    name: Joi.string().required(),
    users: Joi.array().items(Joi.string().hex().length(24)),
    escalationPolicy: Joi.object()
  });

  return JoiHelper.validate(groupObject, groupSchema)
    .then(validatedGroupObject => Group.create(validatedGroupObject));
}

function updateGroup(groupName, groupObject) {
  const groupSchema = Joi.object().keys({
    name: Joi.string(),
    users: Joi.array().items(Joi.string().hex().length(24))
  });

  return JoiHelper.validate(groupObject, groupSchema)
    .then(validatedGroupObject =>
      Group.findOneAndUpdate({ name: groupName }, validatedGroupObject, { new: true }));
}

function addUser(group, userId) {
  const userIdSchema = Joi.string().hex().length(24);

  let tmpGroup;

  return JoiHelper.validate(userId, userIdSchema)
    .then(validatedUserObject => group.addUser(validatedUserObject))
    .then((updatedGroup) => {
      tmpGroup = updatedGroup;
      return userService.addGroupByUserId(userId, updatedGroup.name);
    })
    .then(() => tmpGroup);
}

function removeUser(group, userId) {
  const userIdSchema = Joi.string().hex().length(24);

  return JoiHelper.validate(userId, userIdSchema)
    .then((validatedUserId) => {
      const removeUserFromGroup = group.removeUser(validatedUserId);
      const removeGroupFromUser = userService.removeGroupByUserId(validatedUserId, group.name);
      return Promise.all([removeUserFromGroup, removeGroupFromUser])
        .then(promiseResults => promiseResults[0]);
    });
}

function updateEscalationPolicy(groupName, escalationPolicy) {
  const escalationPolicySchema = Joi.object().keys({
    rotationIntervalInDays: Joi.number(),
    pagingIntervalInDays: Joi.number(),
    subscribers: Joi.array().items(Joi.string().hex().length(24))
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

export default {
  // Group CRUD
  getGroup,
  deleteGroup,
  createGroup,
  updateGroup,
  // Group User Modifications
  addUser,
  removeUser,
  // Escalation Policy Modifications
  updateEscalationPolicy
};
