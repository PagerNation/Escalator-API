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
      delays: Joi.array().items(Joi.number())
    },
    params: {
      userId: Joi.string().hex().length(24).required()
    }
  },

  updateUserAdmin: {
    options: { allowUnknownBody: false },
    body: {
      name: Joi.string(),
      email: Joi.string().email(),
      delays: Joi.array().items(Joi.number()),
      isSysAdmin: Joi.boolean()
    },
    params: {
      userId: Joi.string().hex().length(24).required()
    }
  },

  // GET/POST/DELETE /api/v1/user/:userId/device/:deviceId
  deviceById: {
    params: {
      userId: Joi.string().hex().length(24).required(),
      deviceId: Joi.string().hex().length(24)
    },
    body: {
      sortOrder: Joi.array().items(Joi.string().hex().length(24))
    }
  },

  // PUT
  updateDevice: {
    options: { allowUnknownBody: false },
    params: {
      userId: Joi.string().hex().length(24).required(),
    },
    body: {
      name: Joi.string(),
      type: Joi.string().valid('email', 'phone', 'sms'),
      contactInformation: Joi.string()
    }
  },

  // POST
  addDevice: {
    options: { allowUnknownBody: false },
    params: {
      userId: Joi.string().hex().length(24).required()
    },
    body: {
      device: Joi.object().keys({
        name: Joi.string().required(),
        type: Joi.string().valid('email', 'phone', 'sms').required(),
        contactInformation: Joi.string().required()
      }),
      index: Joi.number().required()
    }
  }
};
