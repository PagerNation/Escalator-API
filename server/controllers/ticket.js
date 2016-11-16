import ticketService from '../services/ticket';

/**
 * Get a ticket by Id
 * @returns {Ticket}
 */
function getById(req, res, next) {
  ticketService.getById(req.params.id)
    .then(ticket => res.json(ticket))
    .catch(e => next(e));
}

/**
 * Create new ticket
 * @returns {Ticket}
 */
function create(req, res, next) {
  ticketService.createTicket(req.body)
    .then(createTicket => res.json(createTicket))
    .catch(e => next(e));
}

/**
 * Update a ticket
 * @returns {Ticket}
 */
function update(req, res, next) {
  ticketService.updateTicket(req.params.id, req.body)
    .then(createTicket => res.json(createTicket))
    .catch(e => next(e));
}

/**
 * Delete a ticket by Id
 * @returns {Ticket}
 */
function deleteById(req, res, next) {
  ticketService.deleteById(req.params.id)
    .then(ticket => res.json(ticket))
    .catch(e => next(e));
}

export default {
  create,
  getById,
  update,
  deleteById
};
