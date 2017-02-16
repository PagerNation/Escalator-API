import _ from 'lodash';
import httpStatus from 'http-status';

function isGroupAdmin(req, res, next) {
  const admins = req.group.admins.map(userId => userId.toString());
  if (_.includes(admins, req.user.id)
    || req.user.isSysAdmin) {
    return next();
  }
  res.status(httpStatus.UNAUTHORIZED).send();
}

export default {
  isGroupAdmin
};
