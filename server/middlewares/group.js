import _ from 'lodash';
import httpStatus from 'http-status';

function isGroupAdmin(req, res, next) {
  const admins = req.group.admins.map(userId => userId.toString());
  if (isAdmin(admins, req.user)) {
    return next();
  }
  res.sendStatus(httpStatus.UNAUTHORIZED);
}

function isAdminOrCurrentUser(req, res, next) {
  const admins = req.group.admins.map(userId => userId.toString());
  if (isAdmin(admins, req.user)
    || req.params.userId === req.user.id.toString()) {
    return next();
  }
  res.sendStatus(httpStatus.UNAUTHORIZED);
}

function isGroupMember(req, res, next) {
  const users = req.group.users.map(userId => userId.toString());
  if (_.includes(users, req.user.id)) {
    return next();
  }
  res.sendStatus(httpStatus.UNAUTHORIZED);
}

function isAdmin(admins, user) {
  return _.includes(admins, user.id) || user.isSysAdmin;
}

export default {
  isGroupAdmin,
  isAdminOrCurrentUser,
  isGroupMember
};
