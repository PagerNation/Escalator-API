import phoneService from '../services/phone';

function buildResponse(req, res, next) {
  const twiml = phoneService.buildTwiml();
  res.type('text/xml');
  res.send(twiml.toString());
}

export default {
  buildResponse
};
