import Joi from 'joi';
import JoiHelper from '../helpers/JoiHelper';
import User from '../models/user';
import Device from '../models/device';

/**
 * Create user
 * @param {Object} userObject - The user details
 * @returns {Promise<User, ValidationError>}
 */
function createUser(userObject) {
  const userSchema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  });

  return JoiHelper.validate(userObject, userSchema)
    .then(validatedUserObject => User.create(validatedUserObject));
}

/**
 * Get user
 * @param {ObjectId} userId - The objectId of user.
 * @returns {Promise<User, APIError>}
 */
function getUser(userId) {
  return User.get(userId);
}

/**
 * Update user
 * @param {ObjectId} userId - The objectId of user.
 * @param {Object} userObject - The user details
 * @returns {Promise<User, ValidationError>}
 */
function updateUser(userId, userObject) {
  const userSchema = Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    auth: Joi.string(),
    escalationPolicy: Joi.object().keys({
      rotationInterval: Joi.number(),
      pagingInterval: Joi.number(),
      subscribers: Joi.array().items(Joi.string().hex().length(24))
    }),
    groups: Joi.array().items(Joi.string().hex().length(24)),
    devices: Joi.array(), // TODO this needs to be updated once the device model is done
    role: Joi.number()
  });

  return JoiHelper.validate(userObject, userSchema)
    .then(validatedUserObject =>
      User.findByIdAndUpdate(userId, validatedUserObject, { new: true }));
}

/**
 * Delete user
 * @param {ObjectId} userId - The objectId of user.
 * @returns {Promise<APIError>}
 */
function deleteUser(userId) {
  return User.delete(userId);
}

/**
 * Device modifications for a user
 */

function getDevice(user, deviceId) {
  return user.getDevice(deviceId);
}

function addDevice(user, deviceObject, index) {
  const deviceSchema = Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid('email', 'phone', 'sms').required(),
    contactInformation: Joi.string().required()
  });

  return JoiHelper.validate(deviceObject, deviceSchema)
    .then((validatedDeviceObject) => {
      const newDevice = new Device(validatedDeviceObject);
      user.addDevice(newDevice, index);
      return newDevice;
    })
}

function sortDevices(user, sortOrder) {
  const joiObjectIdList = Joi.array().items(Joi.string().hex().length(24).required());

  return JoiHelper.validate(sortOrder, joiObjectIdList)
    .then(validatedSortOrder => user.sortDevices(validatedSortOrder));
}

function removeDevice(user, deviceId) {
  return user.removeDevice(deviceId);
}

function addGroup(user, groupName) {
  return JoiHelper.validate(groupName, Joi.string())
    .then(validatedName => user.addGroup(validatedName));
}

function removeGroup(user, groupName) {
  return JoiHelper.validate(groupName, Joi.string())
    .then(validatedName => user.removeGroup(validatedName));
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
  sortDevices,
  removeDevice,
  // User Group Modifications
  addGroup,
  removeGroup
};
