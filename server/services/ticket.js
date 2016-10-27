import Joi from 'joi';
import httpStatus from 'http-status';
import Ticket from '../models/ticket';
import APIError from '../helpers/APIError';

const ticketSchema = {
  groupId: Joi.string().required(),
  metadata: Joi.object().required()
};

const idPattern = Joi.string().hex().length(24).required();

function getById(id) {
  return new Promise((resolve, reject) => {
    Joi.validate(id, idPattern, (err, value) => {
      if (err) {
        reject(err);
      } else {
        Ticket.findById(value).then((ticket) => {
          if (ticket) resolve(ticket);
          else reject(new APIError('No such ticket exists!', httpStatus.NOT_FOUND));
        });
      }
    });
  });
}

function createTicket(ticketDetails) {
  return new Promise((resolve, reject) => {
    Joi.validate(ticketDetails, ticketSchema, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(Ticket.create(value));
      }
    });
  });
}

function updateTicket(id, ticketDetails) {
  return new Promise((resolve, reject) => {
    Joi.validate(ticketDetails, ticketSchema, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(Ticket.findByIdAndUpdate(id, value, { new: true }));
      }
    });
  });
}

function deleteById(id) {
  return new Promise((resolve, reject) => {
    Joi.validate(id, idPattern, (err, value) => {
      if (err) {
        reject(err);
      } else {
        resolve(Ticket.findById(value).remove().exec());
      }
    });
  });
}

export default {
  createTicket,
  getById,
  updateTicket,
  deleteById
};
