import Joi from 'joi';

export default {

  createGroup: {
    body: {
      name: Joi.string().required(),
      users: Joi.array().items(Joi.string().hex().length(24)),
      admins: Joi.array().items(Joi.string().hex().length(24))
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
  },

  userById: {
    params: {
      groupName: Joi.string().required(),
      userId: Joi.string().hex().length(24)
    }
  },

  addUser: {
    options: { allowUnknownBody: false },
    body: {
      userId: Joi.string().hex().length(24)
    },
    params: {
      groupName: Joi.string().required()
    }
  },

  updateEscalationPolicy: {
    options: { allowUnknownBody: false },
    body: {
      rotationIntervalInDays: Joi.number(),
      pagingIntervalInMinutes: Joi.number(),
      subscribers: Joi.array().items(Joi.string().hex().length(24))
    },
    params: {
      groupName: Joi.string().required()
    }
  },

  makeJoinRequest: {
    options: { allowUnknownBody: false },
    body: {
      userId: Joi.string().hex().length(24).required()
    },
    params: {
      groupName: Joi.string().required()
    }
  },

  processJoinRequest: {
    options: { allowUnknownBody: false },
    body: {
      userId: Joi.string().hex().length(24).required(),
      isAccepted: Joi.boolean().required()
    },
    params: {
      groupName: Joi.string().required()
    }
  },

  overrideUser: {
    options: { allowUnknownBody: false },
    body: {
      deactivateDate: Joi.date(),
      reactivateDate: Joi.date(),
      deactivate: Joi.boolean()
    },
    params: {
      groupName: Joi.string().required(),
      userId: Joi.string().hex().length(24).required()
    }
  }
};
