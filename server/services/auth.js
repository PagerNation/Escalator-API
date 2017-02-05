import jwt from 'jsonwebtoken';

import config from '../../config/env';
import User from '../models/user';
import userService from '../services/user';

function loginUser(email) {
  return User.getByEmail(email)
    .then((user) => {
      const token = jwt.sign({ email, id: user._id }, config.auth.jwt_secret);
      const returnObj = {
        user,
        token
      };
      return returnObj;
    });
}

// TODO: User does not have a way of storing passwords, so for dummy authentication we are choosing to
// drop the password entirely
function signupUser(body) {
  const userObj = {
    email: body.email,
    name: body.name
  };

  return User.findByEmailOrCreate(userObj)
    .then((user) => {
      const token = jwt.sign({ email: userObj.email, id: userObj._id }, config.auth.jwt_secret);
      const returnObj = {
        user,
        token
      };
      return returnObj;
    });
}

export default {
  loginUser,
  signupUser
};