import httpStatus from 'http-status';
import alertService from '../services/alert';

function sendPage(req, res, next) {
  alertService.sendPage(req.body.ticket, req.body.user, req.body.device)
    .then(() => res.sendStatus(httpStatus.OK))
    .catch(err => next(err));
}

export default {
  sendPage
};
