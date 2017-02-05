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
      groupName: Joi.string().required(),
      metadata: Joi.object().required()
    }
  },

  // POST /api/v1/ticket
  createTicket: {
    body: {
      groupName: Joi.string().required(),
      metadata: Joi.object().required()
    }
  },

  getTicketsByDate: {
    query: {
      isOpen: Joi.boolean(),
      groupName: Joi.string(),
      to: Joi.number(),
      from: Joi.number()
    }
  }
};
