import Joi from 'joi';
import JoiHelper from '../helpers/JoiHelper';
import Group from '../models/group';

function getGroup(groupName) {
  return Group.get(groupName);
}

function deleteGroup(groupName) {
  return Group.delete(groupName);
}

function createGroup(groupObject) {
  const groupSchema = Joi.object().keys({
    name: Joi.string().required(),
    users: Joi.array().items(Joi.string().hex().length(24))
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

  return JoiHelper.validate(userId, userIdSchema)
    .then((validatedUserObject) => {
      group.addUser(validatedUserObject);
      return group;
    });
}

function removeUser(group, userId) {
  const userIdSchema = Joi.string().hex().length(24);

  return JoiHelper.validate(userId, userIdSchema)
    .then((validatedUserObject) => {
      group.removeUser(validatedUserObject);
      return group;
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
  removeUser
};
