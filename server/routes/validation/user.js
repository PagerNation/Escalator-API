import Joi from 'joi';

export default {
  // POST /api/v1/user
  createUser: {
    body: {
      name: Joi.string().required(),
      email: Joi.string().email().required()
    }
  },

  // GET/DELETE /api/v1/user/:userId
  byId: {
    params: {
      userId: Joi.string().hex().length(24).required()
    }
  },

  // PUT /api/v1/user/:userId
  updateUser: {
    options: { allowUnknownBody: false },
    body: {
      name: Joi.string(),
      email: Joi.string().email(),
      escalationPolicy: Joi.object().keys({
        rotationInterval: Joi.number(),
        pagingInterval: Joi.number(),
        subscribers: Joi.array().items(Joi.string().hex().length(24))
      }),
      devices: Joi.array(), // TODO this needs to be updated once the device model is done
    },
    params: {
      userId: Joi.string().hex().length(24).required()
    }
  }
};
