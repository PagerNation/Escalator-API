import Joi from 'joi';
import User from '../models/user';

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
        reject(err);
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

export default { createUser, getUser, updateUser, deleteUser };
