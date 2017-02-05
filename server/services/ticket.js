import Joi from 'joi';
import Ticket from '../models/ticket';
import JoiHelper from '../helpers/JoiHelper';
import alertService from './alert';

const ticketSchema = {
  groupName: Joi.string().required(),
  metadata: Joi.object().required()
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

function getTicketsByDate(isOpen, groupName, to, from) {
  return Ticket.getTicketsByDate(isOpen, groupName, to, from);
}

export default {
  createTicket,
  getById,
  updateTicket,
  deleteById,
  getTicketsByDate
};
