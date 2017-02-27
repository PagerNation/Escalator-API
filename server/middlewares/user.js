import validate from 'express-validation';
import httpStatus from 'http-status';
import userService from '../services/user';
import paramValidation from '../routes/validation/user';

function loadUser(req, res, next) {
  if (req.user) {
    userService.getUser(req.user.id)
      .then((user) => {
        req.user = user; // eslint-disable-line no-param-reassign
        return next();
      })
      .catch(err => next(err));
  } else {
    next();
  }
}

function validateByRole(req, res, next) {
  let schema = paramValidation.updateUser;
  if (req.user.isSysAdmin) {
    schema = paramValidation.updateUserAdmin;
  }
  validate(schema)(req, res, next);
}

function isSysAdmin(req, res, next) {
  if (req.user.isSysAdmin) {
    return next();
  }
  res.status(httpStatus.UNAUTHORIZED).send();
}

export default {
  loadUser,
  validateByRole,
  isSysAdmin
};
