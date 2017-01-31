import Joi from 'joi';
import JoiHelper from '../helpers/JoiHelper';
import User from '../models/user';
import Device from '../models/device';

const DEVICE_SCHEMA = Joi.object().keys({
  name: Joi.string(),
  type: Joi.string().valid('email', 'phone', 'sms'),
  contactInformation: Joi.string()
});

function createUser(userObject) {
  const userSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });

  return JoiHelper.validate(userObject, userSchema)
    .then(validatedUserObject => User.create(validatedUserObject));
}

function getUser(userId) {
  return User.get(userId);
}

function updateUser(userId, userObject) {
  const userSchema = Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    delays: Joi.array().items(Joi.number())
  });

  return JoiHelper.validate(userObject, userSchema)
    .then(validatedUserObject =>
      User.findByIdAndUpdate(userId, validatedUserObject, { new: true }));
}

function deleteUser(userId) {
  return User.delete(userId);
}

/**
 * Device modifications
 */

function getDevice(user, deviceId) {
  return user.getDevice(deviceId);
}

function addDevice(user, deviceObject, index) {
  return JoiHelper.validate(deviceObject, DEVICE_SCHEMA, { presence: 'required' })
    .then((validatedDeviceObject) => {
      const newDevice = new Device(validatedDeviceObject);
      const updatedUser = user.addDevice(newDevice, index);
      return updatedUser;
    });
}

function updateDevice(user, deviceId, updateInfo) {
  return JoiHelper.validate(updateInfo, DEVICE_SCHEMA)
    .then(validatedUpdateInfo => user.updateDevice(deviceId, validatedUpdateInfo));
}

function sortDevices(user, sortOrder) {
  const joiObjectIdList = Joi.array().items(Joi.string().hex().length(24).required());

  return JoiHelper.validate(sortOrder, joiObjectIdList)
    .then(validatedSortOrder => user.sortDevices(validatedSortOrder));
}

function removeDevice(user, deviceId) {
  return user.removeDevice(deviceId);
}

function addGroupByUserId(userId, groupName) {
  const validatePromise = JoiHelper.validate(groupName, Joi.string());
  const getUserPromise = getUser(userId);

  return Promise.all([getUserPromise, validatePromise])
    .then((promiseResults) => {
      const user = promiseResults[0];
      const validatedName = promiseResults[1];
      return user.addGroup(validatedName);
    });
}

function removeGroup(user, groupName) {
  return JoiHelper.validate(groupName, Joi.string())
    .then(validatedName => user.removeGroup(validatedName));
}

function getGroupsForUser(user) {
  return user.populate('activeGroups')
    .execPopulate()
    .then((user) => { // eslint-disable-line
      return { groups: user.groups };
    });
}

export default {
  // User CRUD
  createUser,
  getUser,
  updateUser,
  deleteUser,
  // User Device Modifications
  getDevice,
  addDevice,
  updateDevice,
  sortDevices,
  removeDevice,
  // User Group Modifications
  addGroupByUserId,
  getGroupsForUser,
  removeGroup
};
