import httpStatus from 'http-status';
import userService from '../services/user';
import Group from '../models/group';

function getUser(req, res) {
  req.user.populate('activeGroups')
    .execPopulate()
    .then(user => res.json(user));
}

function searchByName(req, res, next) {
  userService.searchByName(req.params.partialUserName)
    .then(users => res.json(users))
    .catch(err => next(err));
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
  userService.sortDevices(req.user, req.body.sortOrder)
    .then(user => res.json(user))
    .catch(err => next(err));
}

function removeDevice(req, res, next) {
  userService.removeDevice(req.user, req.params.deviceId)
    .then(user => res.json(user))
    .catch(err => next(err));
}

function getGroupsForUser(req, res, next) {
  userService.getGroupsForUser(req.user)
    .then(groups => Group.populate(groups, 'user'))
    .then(groups => res.json(groups))
    .catch(err => next(err));
}

export default {
  getUser,
  searchByName,
  createUser,
  updateUser,
  deleteUser,
  getDevice,
  addDevice,
  updateDevice,
  sortDevices,
  removeDevice,
  getGroupsForUser
};
