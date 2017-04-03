import Twilio from 'twilio';
import config from '../../config/env';

const twilioSid = config.twilio.accountSid;
const twilioToken = config.twilio.token;

const twilio = new Twilio(twilioSid, twilioToken);

function sendMessage(ticket, user, device) {
  const smsMessage = twilio.messages
    .create({
      to: device.contactInformation,
      from: config.twilio.fromPhone,
      body: ticket.metadata.description
    });
  return Promise.resolve(smsMessage);
}

function makeCall(ticket, user, device) {
  const phoneCall = twilio.calls
    .create({
      url: 'http://localhost:3000/api/v1/twilio',
      to: device.contactInformation,
      from: config.twilio.fromPhone,
    });
  return Promise.resolve(phoneCall);
}

function buildTwiml() {
  const twiml = new Twilio.TwimlResponse();
  twiml.say('Hello Kaleb', { voice: 'alice' });
  return twiml;
}

export default {
  sendMessage,
  makeCall,
  buildTwiml
};
