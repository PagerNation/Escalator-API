import httpStatus from 'http-status';
import alertService from '../services/alert';

function sendPage(req, res, next) {
  alertService.sendPage(req.body.ticketId, req.body.userId, req.body.device)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

export default {
  sendPage
};
