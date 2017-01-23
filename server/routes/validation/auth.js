import Joi from 'joi';

export default {
  // POST login
  byEmailAndPassword: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST signup
  createUser: {
    body: {
      email: Joi.string().required(),
      name: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
