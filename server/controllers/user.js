import httpStatus from 'http-status';
import userService from '../services/user';

/**
 * Get user
 * @returns {User}
 */
function getUser(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 * @returns {User}
 */
function createUser(req, res, next) {
  userService.createUser(req.body)
    .then(createdUser => res.json(createdUser))
    .catch(err => next(err));
}

/**
 * Update user
 * @returns {User} - The updated user object
 */
function updateUser(req, res, next) {
  userService.updateUser(req.params.userId, req.body)
    .then(updatedUser => res.json(updatedUser))
    .catch(err => next(err));
}

/**
 * Delete user
 */
function deleteUser(req, res, next) {
  userService.deleteUser(req.params.userId)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

/**
 * Device modifications
 */

/**
 * Get device
 */
function getDevice(req, res, next) {
  userService.getDevice(req.user, req.params.deviceId)
    .then(device => res.json(device))
    .catch(err => next(err));
}

/**
 * Add device
 */
function addDevice(req, res, next) {
  userService.addDevice(req.user, req.body.device, req.body.index)
    .then(device => res.json(device))
    .catch(err => next(err));
}

/**
 * Sort devices
 */
function sortDevices(req, res, next) {
  userService.sortDevices(req.user, req.params.sortOrder)
    .then(user => res.json(user))
    .catch(err => next(err));
}

/**
 * Remove device
 */
function removeDevice(req, res, next) {
  userService.removeDevice(req.user, req.params.deviceId)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

/**
 * Loads user into the request
 */
function loadUser(req, res, next, userId) {
  userService.getUser(userId)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(err => next(err));
}

export default {
  // User CRUD
  getUser,
  createUser,
  updateUser,
  deleteUser,
  // User device modifications
  getDevice,
  addDevice,
  sortDevices,
  removeDevice,
  // User helpers
  loadUser
};
