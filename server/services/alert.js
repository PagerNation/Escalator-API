import User from '../models/user';
import emailService from './email';
import phoneService from './phone';

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
    });
}

function sendPage(ticket, user, device) {
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
