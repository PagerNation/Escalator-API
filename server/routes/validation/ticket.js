import Joi from 'joi';
import config from '../../../config/env';

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
      limit: Joi.number().max(config.maximumTicketQueryLimit),
      isOpen: Joi.boolean(),
      groupNames: Joi.any().allow(Joi.string(), Joi.array().items(Joi.string())),
      to: Joi.number(),
      from: Joi.number()
    }
  }
};
