import Joi from 'joi';

export default {

  // GET/DELETE /api/v1/ticket/:id
  byId: {
    params: {
      id: Joi.string().hex().length(24).required()
    }
  },

  // PUT /api/v1/ticket/:id
  updateTicket: {
    params: {
      id: Joi.string().hex().length(24).required()
    },

    body: {
      groupId: Joi.string().required(),
      metadata: Joi.object().required()
    }
  },

  // POST /api/v1/ticket
  createTicket: {
    body: {
      groupId: Joi.string().required(),
      metadata: Joi.object().required()
    }
  },
};
