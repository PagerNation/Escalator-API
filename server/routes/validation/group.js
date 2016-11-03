import Joi from 'joi';

export default {

  createGroup: {
    body: {
      name: Joi.string().required(),
      users: Joi.array().items(Joi.string().hex().length(24))
    }
  },

  byName: {
    params: {
      groupName: Joi.string().required()
    }
  },

  updateGroup: {
    options: { allowUnknownBody: false },
    body: {
      name: Joi.string(),
      users: Joi.array().items(Joi.string().hex().length(24))
    },
    params: {
      groupName: Joi.string().required()
    }
  }
};
