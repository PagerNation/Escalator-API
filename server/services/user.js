import Joi from 'joi';
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

  return new Promise((resolve, reject) => {
    Joi.validate(userObject, userSchema, (err, value) => {
      if (err) {
        return reject(err);
      }
      resolve(User.create(value));
    });
  });
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

  return new Promise((resolve, reject) => {
    Joi.validate(userObject, userSchema, (err, value) => {
      if (err) {
        return reject(err);
      }
      // TODO might have to have another if else here to catch error updating
      resolve(User.findByIdAndUpdate(userId, value, { new: true }));
    });
  });
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

  return new Promise((resolve, reject) => {
    Joi.validate(deviceObject, deviceSchema, (err, validatedDeviceObject) => {
      if (err) {
        return reject(err);
      }

      const newDevice = new Device(validatedDeviceObject);
      user.addDevice(newDevice, index);
      resolve(newDevice);
    });
  });
}

function sortDevices(user, sortOrder) {
  const joiObjectIdList = Joi.array().items(Joi.string().hex().length(24).required());

  return new Promise((resolve, reject) => {
    Joi.validate(sortOrder, joiObjectIdList, (err, validatedSortOrder) => {
      if (err) {
        return reject(err);
      }
      resolve(user.sortDevices(validatedSortOrder));
    });
  });
}

function removeDevice(user, deviceId) {
  return user.removeDevice(deviceId);
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
  removeDevice
};
