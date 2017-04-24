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

  getMostRecentTickets: {
    params: {
      groups: Joi.array().items(Joi.string())
    }
  },

  getTicketsByDate: {
    query: {
      sortBy: Joi.string(),
      limit: Joi.number().max(20),
      isOpen: Joi.boolean(),
      groupName: Joi.any().allow(Joi.string(), Joi.array().items(Joi.string())),
      to: Joi.number(),
      from: Joi.number()
    }
  }
};
