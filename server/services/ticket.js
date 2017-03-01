import Joi from 'joi';
import _ from 'lodash';
import Ticket, { actionTypes } from '../models/ticket';
import JoiHelper from '../helpers/JoiHelper';
import alertService from './alert';

const ticketSchema = {
  groupName: Joi.string().required(),
  metadata: Joi.object().required(),
  isOpen: Joi.boolean(),
  createdAt: Joi.number()
};

const idPattern = Joi.string().hex().length(24).required();

function getById(id) {
  return JoiHelper.validate(id, idPattern)
    .then(validatedId => Ticket.get(validatedId));
}

function createTicket(ticketDetails) {
  return JoiHelper.validate(ticketDetails, ticketSchema)
    .then(validatedDetails => Ticket.create(validatedDetails))
    .then((ticket) => {
      alertService.createAlert(ticket)
        .catch(); // TODO: Retry here, maybe even move to eventEmitter so we don't catch here
      return ticket;
    });
}

function updateTicket(id, ticketDetails) {
  return JoiHelper.validate(ticketDetails, ticketSchema)
    .then(validatedDetails => Ticket.findByIdAndUpdate(id, validatedDetails, { new: true }));
}

function deleteById(id) {
  return JoiHelper.validate(id, idPattern)
    .then(validatedId => Ticket.delete(validatedId));
}

function getTicketsByDate(filterOpts) {
  return Ticket.getTicketsByDate(filterOpts);
}

function addAction(ticketId, actionType, userId, device) {
  const schema = {
    ticketId: Joi.string().hex().length(24).required(),
    actionType: Joi.any().only(_.keys(actionTypes)).required(),
    userId: Joi.string().hex().length(24),
    device: Joi.object()
  };
  return JoiHelper.validate({ ticketId, actionType, userId, device }, schema)
    .then(values => Ticket.addAction(values.ticketId, values.actionType, values.userId, values.device));
}

function removeAction(ticketId, actionType, timestamp, userId) {
  const schema = {
    ticketId: Joi.string().hex().length(24).required(),
    actionType: Joi.any().only(_.keys(actionTypes)).required(),
    timestamp: Joi.number(),
    userId: Joi.string().hex().length(24)
  };
  return JoiHelper.validate({ ticketId, actionType, timestamp, userId }, schema)
    .then(v => Ticket.removeAction(v.ticketId, v.actionType, v.timestamp, v.userId));
}

export default {
  createTicket,
  getById,
  updateTicket,
  deleteById,
  getTicketsByDate,
  addAction,
  removeAction
};
