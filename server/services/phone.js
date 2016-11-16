import Twilio from 'twilio';
import config from '../../config/env';

const twilioSid = config.twilio.accountSid;
const twilioToken = config.twilio.token;

const twilio = new Twilio(twilioSid, twilioToken);

function sendMessage(ticket, user, device) {
  return twilio.messages
    .create({
      to: device.contactInformation,
      from: config.twilio.fromPhone,
      body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
    });
}

function makeCall(ticket, user, device) {
  return twilio.calls
    .create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to: device.contactInformation,
      from: config.twilio.fromPhone,
    });
}

export default {
  sendMessage,
  makeCall
};
