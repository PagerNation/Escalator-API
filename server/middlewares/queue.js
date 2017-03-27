import httpStatus from 'http-status';
import config from '../../config/env';

function isQueue(req, res, next) {
  if (req.headers.authorization === config.auth.queueSecret) {
    return next();
  }
  res.sendStatus(httpStatus.UNAUTHORIZED);
}

export default {
  isQueue
};
