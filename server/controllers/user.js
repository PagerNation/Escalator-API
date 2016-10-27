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
 * Loads user into the request
 */
function load(req, res, next, userId) {
  userService.getUser(userId)
    .then((user) => {
      req.user = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(err => next(err));
}

export default { getUser, createUser, updateUser, deleteUser, load };
