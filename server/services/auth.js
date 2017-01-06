import jwt from 'jsonwebtoken';

import config from '../../config/env';
import User from '../models/user';
import userService from '../services/user';

function loginUser(email) {
  return User.getByEmail(email)
    .then((user) => {
      const token = jwt.sign({ email }, config.auth.jwt_secret);
      const returnObj = {
        user: user,
        token: token
      };
      return returnObj;
    });
}

function signupUser(body) {
  const userObj = {
    email: body.email,
    name: body.name
  };

  return User.findByEmailOrCreate(userObj)
    .then((user) => {
      const token = jwt.sign({ email: userObj.email }, config.auth.jwt_secret);
      const returnObj = {
        user: user,
        token: token
      };
      return returnObj;
    });
}

export default {
  loginUser,
  signupUser
};
