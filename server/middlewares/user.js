import validate from 'express-validation';
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

export default {
  loadUser,
  validateByRole
};
