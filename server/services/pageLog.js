import Joi from 'joi';
import _ from 'lodash';
import Ticket, { actionTypes } from '../models/ticket';
import JoiHelper from '../helpers/JoiHelper';

function addAction(ticketId, actionType, userId) {
  const schema = {
    ticketId: Joi.string().hex().length(24).required(),
    actionType: Joi.any().only(_.keys(actionTypes)).required(),
    userId: Joi.string().hex().length(24)
  };
  return JoiHelper.validate({ ticketId, actionType, userId }, schema)
    .then(values => Ticket.addAction(values.ticketId, values.actionType, values.userId));
}

function removeAction(ticketId, actionType, timestamp, userId) {
  const schema = {
    ticketId: Joi.string().hex().length(24).required(),
    actionType: Joi.any().only(_.keys(actionTypes)).required(),
    timestamp: Joi.number(),
    userId: Joi.string().hex().length(24)
  };
  return JoiHelper.validate({ ticketId, actionType, timestamp, userId }, schema)
    .then(values => Ticket.removeAction(values.ticketId, values.actionType, values.timestamp, values.userId));
}

export default {
  addAction,
  removeAction
};
