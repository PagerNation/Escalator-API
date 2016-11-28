import httpStatus from 'http-status';
import userService from '../services/user';

function getUser(req, res) {
  return res.json(req.user);
}

function createUser(req, res, next) {
  userService.createUser(req.body)
    .then(createdUser => res.json(createdUser))
    .catch(err => next(err));
}

function updateUser(req, res, next) {
  userService.updateUser(req.params.userId, req.body)
    .then(updatedUser => res.json(updatedUser))
    .catch(err => next(err));
}

function deleteUser(req, res, next) {
  userService.deleteUser(req.params.userId)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

/**
 * Device modifications
 */

function getDevice(req, res, next) {
  userService.getDevice(req.user, req.params.deviceId)
    .then(device => res.json(device))
    .catch(err => next(err));
}

function addDevice(req, res, next) {
  userService.addDevice(req.user, req.body.device, req.body.index)
    .then(user => res.json(user))
    .catch(err => next(err));
}

function updateDevice(req, res, next) {
  userService.updateDevice(req.user, req.params.deviceId, req.body)
    .then(user => res.json(user))
    .catch(err => next(err));
}

function sortDevices(req, res, next) {
  userService.sortDevices(req.user, req.params.sortOrder)
    .then(user => res.json(user))
    .catch(err => next(err));
}

function removeDevice(req, res, next) {
  userService.removeDevice(req.user, req.params.deviceId)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

function getGroupsForUser(req, res, next) {
  userService.getGroupsForUser(req.user)
    .then(groups => res.json(groups))
    .catch(err => next(err));
}

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
  updateDevice,
  sortDevices,
  removeDevice,
  // User Groups
  getGroupsForUser,
  // User helpers
  loadUser
};
