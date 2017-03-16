import Faker from 'faker';
import User from '../models/user';
import Device from '../models/device';
import Group from '../models/group';
import Ticket, { actionTypes } from '../models/ticket';
import EscalationPolicy from '../models/escalationPolicy';
import authService from '../services/auth';

const uuid = {
  user: '123456789012345678901234',
  ticket: '123456789012345678909999'
};

const fixtures = {
  user(user = {}) {
    const obj = {
      name: user.name || Faker.internet.userName(),
      email: user.email || Faker.internet.email(),
      isSysAdmin: user.isSysAdmin || false
    };

    if (user.groups) {
      obj.groups = user.groups;
    }

    return obj;
  },
  emailDevice(device = {}) {
    return {
      name: device.name || Faker.lorem.word(),
      type: device.type || 'email',
      contactInformation: device.contactInformation || Faker.internet.email()
    };
  },
  smsDevice(device = {}) {
    return {
      name: device.name || Faker.lorem.word(),
      type: device.type || 'sms',
      contactInformation: device.contactInformation || Faker.phone.phoneNumber('##########')
    };
  },
  phoneDevice(device = {}) {
    return {
      name: device.name || Faker.lorem.word(),
      type: device.type || 'phone',
      contactInformation: device.contactInformation || Faker.phone.phoneNumber('##########')
    };
  },
  group(group = {}) {
    return {
      name: group.name || Faker.lorem.word(),
      users: group.users,
      escalationPolicy: group.escalationPolicy || EscalationPolicy.defaultEscalationPolicy(),
      admins: group.admins || [uuid.user],
      joinRequests: group.joinRequests,
      lastRotated: group.lastRotated || Date.now()
    };
  },
  ticket(ticket = {}) {
    return {
      groupName: ticket.groupName || 'testGroupName',
      metadata: ticket.metadata || {
        title: Faker.lorem.word(),
        description: Faker.hacker.phrase()
      },
      isOpen: ticket.isOpen,
      createdAt: ticket.createdAt || Date.now()
    };
  },
  escalationPolicy(escalationPolicy = {}) {
    return {
      rotationIntervalInDays: escalationPolicy.rotationIntervalInDays || 7,
      pagingIntervalInMinutes: escalationPolicy.pagingIntervalInMinutes || 15,
      subscribers: escalationPolicy.subscribers || ['57e590a0140ebf1cc48bb1bf']
    };
  },
  action(action = {}) {
    return {
      actionTaken: action.actionTaken || actionTypes.ACKNOWLEDGED,
      timestamp: action.timestamp || Date.now(),
      userId: action.userId || uuid.user
    };
  }
};

const models = {
  user: User,
  device: Device,
  group: Group,
  ticket: Ticket,
  escalationPolicy: EscalationPolicy
};

function build(model, object) {
  return new Promise((resolve, reject) => {
    models[model].create(object, (err, u) => {
      if (err) {
        reject(err);
      }
      resolve(u);
    });
  });
}

function buildAndAuth(model, object) {
  const response = {};
  return build(model, object)
    .then((u) => {
      response.user = u;
      return authService.loginUser(u.email);
    })
    .then((authObject) => {
      response.token = authObject.token;
      return response;
    });
}

export default { uuid, fixtures, build, buildAndAuth };

