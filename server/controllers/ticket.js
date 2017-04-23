import ticketService from '../services/ticket';
import Ticket from '../models/ticket';

function getById(req, res, next) {
  ticketService.getById(req.params.id)
    .then(ticket => res.json(ticket))
    .catch(e => next(e));
}

function create(req, res, next) {
  ticketService.createTicket(req.body)
    .then(createTicket => res.json(createTicket))
    .catch(e => next(e));
}

function update(req, res, next) {
  ticketService.updateTicket(req.params.id, req.body)
    .then(createTicket => res.json(createTicket))
    .catch(e => next(e));
}

function close(req, res, next) {
  ticketService.close(req.params.id)
    .then(ticket => res.json(ticket))
    .catch(e => next(e));
}

function deleteById(req, res, next) {
  ticketService.deleteById(req.params.id)
    .then(ticket => res.json(ticket))
    .catch(e => next(e));
}

function getTicketsByDate(req, res, next) {
  ticketService.getTicketsByDate(req.query)
    .then(tickets => Ticket.populate(tickets, 'actions.user'))
    .then(tickets => res.json(tickets))
    .catch(e => next(e));
}

function getMostRecentTickets(req, res, next) {
  ticketService.getMostRecentTickets(req.query.groups)
    .then(tickets => Ticket.populate(tickets, 'actions.user'))
    .then(tickets => res.json(tickets))
    .catch(e => next(e));
}

export default {
  create,
  getById,
  update,
  close,
  deleteById,
  getTicketsByDate,
  getMostRecentTickets
};
