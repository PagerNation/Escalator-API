import Joi from 'joi';
import Ticket from '../models/ticket';
import JoiHelper from '../helpers/JoiHelper';

const ticketSchema = {
  groupId: Joi.string().required(),
  metadata: Joi.object().required()
};

const idPattern = Joi.string().hex().length(24).required();

function getById(id) {
  return JoiHelper.validate(id, idPattern)
    .then(validatedId => Ticket.get(validatedId));
}

function createTicket(ticketDetails) {
  return JoiHelper.validate(ticketDetails, ticketSchema)
    .then(validatedDetails => Ticket.create(validatedDetails));
}

function updateTicket(id, ticketDetails) {
  return JoiHelper.validate(ticketDetails, ticketSchema)
    .then(validatedDetails => Ticket.findByIdAndUpdate(id, validatedDetails, { new: true }));
}

function deleteById(id) {
  return JoiHelper.validate(id, idPattern)
    .then(validatedId => Ticket.delete(validatedId));
}

export default {
  createTicket,
  getById,
  updateTicket,
  deleteById
};
