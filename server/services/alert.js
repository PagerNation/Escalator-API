import request from 'request-promise-native';
import { actionTypes } from '../models/ticket';
import config from '../../config/env';
import emailService from './email';
import phoneService from './phone';
import ticketService from './ticket';
import userService from './user';

const ONE_MINUTE_MILLISECONDS = 60 * 1000;

function createAlert(ticket) {
  return ticket
    .populate('group')
    .execPopulate()
    .then(pTicket => pTicket.group.populate('escalationPolicy.subscribers').execPopulate())
    .then(group => generateAllPageRequests(group, ticket))
    .then(pageRequests => sendPageRequestsToQueue(pageRequests))
    .then(() => ticketService.addAction(ticket.id, actionTypes.CREATED));
}

function generateAllPageRequests(group, ticket) {
  let pageRequests = [];
  let currentDelay = 0;
  const title = ticket.metadata.title;

  for (const user of group.escalationPolicy.subscribers) {
    const userPages = generateUserPageRequests(ticket.id, user, currentDelay, title);
    pageRequests = pageRequests.concat(userPages);
    currentDelay += group.escalationPolicy.pagingIntervalInMinutes;
  }
  return pageRequests;
}

function generateUserPageRequests(ticketId, user, delay, title) {
  const userPageRequests = [];
  let currUserDelay = 0;

  for (let i = 0; i < user.devices.length; i++) {
    if (i !== 0) {
      currUserDelay += user.delays[i - 1] || config.defaultDelay;
    }

    userPageRequests.push({
      ticketId,
      userId: user.id,
      device: user.devices[i],
      delay: (delay + currUserDelay) * ONE_MINUTE_MILLISECONDS,
      title
    });
  }
  return userPageRequests;
}

function sendPageRequestsToQueue(userPageRequests) {
  const options = {
    method: 'POST',
    uri: `${config.queueHost}/${config.queuePath}`,
    body: {
      pages: userPageRequests
    },
    json: true
  };

  return request(options)
    .then((futurePages) => {
      if (!futurePages.length) {
        return;
      }
      const ticketId = futurePages[0].data.ticketId;
      const pageIds = futurePages.map(page => page.id);
      ticketService.updateTicket(ticketId, { pageIds });
    });
}

function sendPage(ticketId, userId, device) {
  const userPromise = userService.getUser(userId);
  const ticketPromise = ticketService.getById(ticketId);

  return Promise.all([userPromise, ticketPromise])
    .then((results) => {
      const user = results[0];
      const ticket = results[1];

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
    })
    .then(() => ticketService.addAction(ticketId, actionTypes.PAGE_SENT, userId, device));
}

export default {
  createAlert,
  sendPage,
  generateUserPageRequests
};
