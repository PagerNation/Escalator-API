import request from 'request-promise-native';
import Joi from 'joi';
import _ from 'lodash';
import config from '../../config/env';
import Ticket, { actionTypes } from '../models/ticket';
import JoiHelper from '../helpers/JoiHelper';
import alertService from './alert';

const ticketSchema = {
  groupName: Joi.string(),
  metadata: Joi.object(),
  isOpen: Joi.boolean(),
  createdAt: Joi.number(),
  pageIds: Joi.array().items(Joi.number())
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

function close(id) {
  return updateTicket(id, { isOpen: false })
    .then(ticket => cancelFuturePages(ticket.pageIds));
}

function cancelFuturePages(pageIds) {
  const options = {
    method: 'DELETE',
    uri: `${config.queueHost}/${config.queuePath}`,
    body: {
      pageIds
    },
    json: true
  };

  return request(options);
}

function deleteById(id) {
  return JoiHelper.validate(id, idPattern)
    .then(validatedId => Ticket.delete(validatedId));
}

function getMostRecentTickets(groups) {
  return Ticket.getMostRecentTickets(groups);
}

function getTicketsByDate(filterOpts) {
  return Ticket.getTicketsByDate(filterOpts);
}

function addAction(ticketId, actionType, user, device) {
  const schema = {
    ticketId: Joi.string().hex().length(24).required(),
    actionType: Joi.any().only(_.keys(actionTypes)).required(),
    user: Joi.string().hex().length(24),
    device: Joi.object()
  };
  return JoiHelper.validate({ ticketId, actionType, user, device }, schema)
    .then(values =>
      Ticket.addAction(values.ticketId, values.actionType, values.user, values.device));
}

function removeAction(ticketId, actionId) {
  const schema = {
    ticketId: Joi.string().hex().length(24).required(),
    actionId: Joi.string().hex().length(24)
  };
  return JoiHelper.validate({ ticketId, actionId }, schema)
    .then(v => Ticket.removeAction(v.ticketId, v.actionId));
}

export default {
  createTicket,
  getById,
  updateTicket,
  close,
  deleteById,
  getMostRecentTickets,
  getTicketsByDate,
  addAction,
  removeAction
};
