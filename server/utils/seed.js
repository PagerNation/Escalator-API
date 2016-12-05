import { build, fixtures } from './factories';
import groupService from '../services/group';

const EMAIL_CONTACT_INFORMATION = ''; // update these with desired values
const PHONE_CONTACT_INFORMATION = '';

let USERS;
let GROUPS;

function seedAll(numGroups = 40) {
  const numUsers = numGroups * 3;

  return seedUsers(numUsers)
    .then(() => seedGroups(numGroups))
    .then(() => {
      let groupPromise = Promise.resolve();

      for (let j = 0; j < GROUPS.length; j += 1) {
        const i = j;

        groupPromise = groupService.addUser(GROUPS[i], USERS[(i * 3)].id)
          .then(() => groupService.addUser(GROUPS[i], USERS[(i * 3) + 1].id))
          .then(() => groupService.addUser(GROUPS[i], USERS[(i * 3) + 2].id))
          .then(() => build('ticket', fixtures.ticket({ groupName: GROUPS[i].name })));
      }

      return groupPromise;
    });
}

function seedUsers(numToSeed) {
  USERS = [];
  return genericSeeder(numToSeed, createUser);
}

function createUser() {
  return build('user', fixtures.user())
    .then(newUser => addEmailDevice(newUser, EMAIL_CONTACT_INFORMATION))
    .then(updatedUser => addPhoneDevice(updatedUser, PHONE_CONTACT_INFORMATION))
    .then(updatedUser => addEscalationPolicy(updatedUser))
    .then(updatedUser => USERS.push(updatedUser));
}

function seedGroups(numToSeed) {
  GROUPS = [];
  return genericSeeder(numToSeed, createGroup);
}

function createGroup(name) {
  return build('group', fixtures.group({ name }))
    .then(newGroup => GROUPS.push(newGroup));
}

function addEmailDevice(user, contactInformation) {
  return build('device', fixtures.emailDevice({ contactInformation }))
    .then(device => user.addDevice(device, 0));
}

function addPhoneDevice(user, contactInformation) {
  return build('device', fixtures.phoneDevice({ contactInformation }))
    .then(device => user.addDevice(device, 0));
}

function addEscalationPolicy(user) {
  const deviceIds = user.devices.map((device) => { // eslint-disable-line
    return { subId: device.id, pagingInterval: 5 };
  });

  return build('escalationPolicy', fixtures.escalationPolicy({ subscribers: deviceIds }))
    .then((escalationPolicy) => {
      user.escalationPolicy = escalationPolicy; // eslint-disable-line
      return user.save();
    });
}

function genericSeeder(numToSeed, seeder) {
  const promises = [];

  for (let i = 0; i < numToSeed; i += 1) {
    promises.push(seeder());
  }

  return Promise.all(promises);
}

export default { seedAll, seedUsers, seedGroups };
