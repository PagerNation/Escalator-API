import scheduler from 'node-schedule';
import httpStatus from 'http-status';
import groupService from '../services/group';
import Group from '../models/group';

function getGroup(req, res) {
  req.group.populate('users joinRequests')
    .execPopulate()
    .then(group => res.json(group));
}

function deleteGroup(req, res, next) {
  groupService.deleteGroup(req.params.groupName)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

function createGroup(req, res, next) {
  groupService.createGroup(req.body)
    .then(createdGroup => res.json(createdGroup))
    .catch(err => next(err));
}

function updateGroup(req, res, next) {
  groupService.updateGroup(req.params.groupName, req.body)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function searchByName(req, res, next) {
  groupService.searchByName(req.params.partialGroupName)
    .then(groups => Group.populate(groups, 'users'))
    .then(groups => res.json(groups))
    .catch(err => next(err));
}

function addUser(req, res, next) {
  groupService.addUser(req.group, req.body.userId)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function removeUser(req, res, next) {
  groupService.removeUser(req.group, req.params.userId)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function updateEscalationPolicy(req, res, next) {
  groupService.updateEscalationPolicy(req.group.name, req.body)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function addAdmin(req, res, next) {
  groupService.addAdmin(req.group.name, req.params.userId)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function removeAdmin(req, res, next) {
  groupService.removeAdmin(req.group.name, req.params.userId)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function makeJoinRequest(req, res, next) {
  groupService.makeJoinRequest(req.group.name, req.body.userId)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function processJoinRequest(req, res, next) {
  groupService.processJoinRequest(req.group, req.body.userId, req.body.isAccepted)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function scheduleEPRotation(req, res, next) {
  groupService.scheduleEPRotation(req.group)
    .then(updatedGroup => updatedGroup.populate('users').execPopulate())
    .then(updatedGroup => res.json(updatedGroup))
    .catch(err => next(err));
}

function overrideUser(req, res, next) {
  if (req.body.deactivate) {
    groupService.scheduleDeactivateUser(req.group,
                                        req.user.id,
                                        req.body.deactivateDate,
                                        req.body.reactivateDate)
      .then(returnObj => returnObj.group.populate('users').execPopulate())
      .then(group => res.json(group))
      .catch(err => next(err));
  } else {
    groupService.scheduleReactivateUser(req.group, req.user.id)
      .then(returnObj => returnObj.group.populate('users').execPopulate())
      .then(group => res.json(group))
      .catch(err => next(err));
  }
}
function listSchedules(req, res) {
  return res.json(scheduler.scheduledJobs);
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

export default {
  getGroup,
  deleteGroup,
  createGroup,
  updateGroup,
  searchByName,
  addAdmin,
  removeAdmin,
  makeJoinRequest,
  processJoinRequest,
  addUser,
  removeUser,
  updateEscalationPolicy,
  scheduleEPRotation,
  overrideUser,
  listSchedules,
  load
};
