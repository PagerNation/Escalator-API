import httpStatus from 'http-status';
import groupService from '../services/group';

/**
 * Get a group
 * @returns {Group}
 */
function getGroup(req, res) {
  res.json(req.group);
}

/**
 * Delete a group
 */
function deleteGroup(req, res, next) {
  groupService.deleteGroup(req.params.groupName)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

/**
 * Create a group
 * @returns {Group}
 */
function createGroup(req, res, next) {
  groupService.createGroup(req.body)
    .then(createdGroup => res.json(createdGroup))
    .catch(err => next(err));
}

/**
 * Updates a group
 * @returns {Group}
 */
function updateGroup(req, res, next) {
  groupService.updateGroup(req.params.groupName, req.body)
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function addUser(req, res, next) {
  groupService.addUser(req.group, req.body.userId)
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function removeUser(req, res, next) {
  groupService.removeUser(req.group, req.params.userId)
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

/**
 * Loads a group into the request based on group name
 */
function load(req, res, next, groupName) {
  groupService.getGroup(groupName)
    .then((group) => {
      req.group = group; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(err => next(err));
}

export default { getGroup, deleteGroup, createGroup, updateGroup, addUser, removeUser, load };
