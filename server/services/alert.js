import User from '../models/user';
import { actionTypes } from '../models/ticket';
import emailService from './email';
import phoneService from './phone';
import ticketService from './ticket';

function createAlert(ticket) {
  // THIS IS ALL GETTING DELETED, JUST FOR THE SENDPAGE FUNCTION TESTING
  return ticket
    .populate('group')
    .execPopulate()
    .then(pTicket => pTicket.group.escalationPolicy.subscribers[0].subId)
    .then(userId => User.findById(userId))
    .then((user) => {
      const firstDevice = user.devices[0];
      sendPage(ticket, user, firstDevice);
    })
    .then(() => ticketService.addAction(ticket.id, actionTypes.CREATED));
}

function sendPage(ticket, user, device) {
  ticketService.addAction(ticket.id, actionTypes.PAGE_SENT, user.id);

  switch (device.type) {
    case ('email'):
      return emailService.sendEmail(ticket, user, device);
    case ('sms'):
      return phoneService.sendMessage(ticket, user, device);
    case ('phone'):
      return phoneService.makeCall(ticket, user, device);
    default:
      return Promise.reject(new Error(`Invalid device type: ${device.type} on User: "${user.id}"`));
  }
}

export default {
  createAlert,
  sendPage
};
