import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/ticket';

import ticketController from '../controllers/ticket';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/:id')

  /** GET /api/v1/ticket/:id - Get a ticket by Id */
  .get(validate(paramValidation.byId), ticketController.getById)

  /** PUT /api/v1/ticket/:id - Update a ticket */
  .put(validate(paramValidation.updateTicket), ticketController.update)

  /** PUT /api/v1/ticket/:id - Update a ticket */
  .delete(validate(paramValidation.byId), ticketController.deleteById);

router.route('/')

  /** POST /api/v1/ticket - Create new ticket */
  .post(validate(paramValidation.createTicket), ticketController.create);

export default router;
