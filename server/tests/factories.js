import Faker from 'faker';
import User from '../models/user';
import Device from '../models/device';
import Group from '../models/group';
import Ticket from '../models/ticket';
import EscalationPolicy from '../models/escalationPolicy';

const uuid = {
  user: '123456789012345678901234'
};

const fixtures = {
  user(user = {}) {
    return {
      id: user.id,
      name: user.name || Faker.internet.userName(),
      email: user.email || Faker.internet.email()
    };
  },
  email_device(device = {}) {
    return {
      name: device.name || Faker.lorem.word(),
      type: device.type || 'email',
      contactInformation: device.contactInformation || Faker.internet.email()
    };
  },
  sms_device(device = {}) {
    return {
      name: device.name || Faker.lorem.word(),
      type: device.type || 'sms',
      contactInformation: device.contactInformation || Faker.phone.phoneNumber()
    };
  },
  group(group = {}) {
    return {
      name: group.name || Faker.internet.userName(),
      users: group.users || [uuid.user]
    };
  },
  ticket(ticket = {}) {
    return {
      groupId: ticket.groupId || '551137c2f9e1fac808a5f572',
      metadata: ticket.metadata || {
        message: Faker.hacker.phrase(),
        metrics: {
          foo: 'bar',
          jiggawatts: 42
        }
      }
    };
  },
  escalationPolicy(escalationPolicy = {}) {
    return {
      rotationInterval: escalationPolicy.rotationInterval || 7,
      pagingInterval: escalationPolicy.pagingInterval || 15,
      subscribers: escalationPolicy.subscribers || ['57e590a0140ebf1cc48bb1bf']
    };
  },
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
      resolve(u);
    });
  });
}

export default { uuid, fixtures, build };
