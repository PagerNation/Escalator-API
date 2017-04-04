import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/ticket';
import ticketController from '../controllers/ticket';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/all')
  .get(validate(paramValidation.getTicketsByDate), ticketController.getTicketsByDate);

router.route('/:id')
  .get(validate(paramValidation.byId), ticketController.getById)
  .post(validate(paramValidation.byId), ticketController.close)
  .put(validate(paramValidation.updateTicket), ticketController.update)
  .delete(validate(paramValidation.byId), ticketController.deleteById);

router.route('/')
  .post(validate(paramValidation.createTicket), ticketController.create);

export default router;
