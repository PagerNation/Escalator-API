import httpStatus from 'http-status';
import userService from '../../services/user';
import User from '../../models/user';
import Device from '../../models/device';
import { build, fixtures } from '../../utils/factories';
import Group from '../../models/group';
import { buildUserAndGroups } from '../helpers/user_helper';

describe('## User Service', () => {
  const baseUser = {
    name: 'Jarryd',
    email: 'abc@google.com'
  };

  const baseDevice = {
    name: 'email',
    type: 'email',
    contactInformation: '1234567890'
  };

  describe('# createUser()', () => {
    context('with valid user details', () => {
      it('creates a new user', (done) => {
        userService.createUser(baseUser)
          .then((createdUser) => {
            expect(createdUser).to.exist;
            expect(createdUser.name).to.equal('Jarryd');
            expect(createdUser.email).to.equal('abc@google.com');
            expect(createdUser.role).to.equal(0);
            expect(createdUser.auth).to.be.null;
            expect(createdUser.escalationPolicy).to.be.null;
            expect(createdUser.groups).to.be.empty;
            expect(createdUser.devices).to.be.empty;
            expect(createdUser.createdAt).to.be.not.null;
            done();
          })
          .catch(err => done(err));
      });
    });

    context('with missing user details', () => {
      const missingNameUser = {
        email: 'abc@google.com'
      };

      const missingEmailUser = {
        name: 'Jarryd'
      };

      it('should fail validation due to the user missing a name', (done) => {
        userService.createUser(missingNameUser)
          .catch((err) => {
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"name" is required');
            done();
          });
      });

      it('should fail validation due to the user missing an email', (done) => {
        userService.createUser(missingEmailUser)
          .catch((err) => {
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"email" is required');
            done();
          });
      });
    });

    context('with extra fields in the user details', () => {
      const extraFakeFieldUser = {
        name: 'Jarryd',
        email: 'abc@google.com',
        notAField: 'this should not be here'
      };

      const extraFieldUser = {
        name: 'Jarryd',
        email: 'abc@google.com',
        role: 0
      };

      it('should fail validation with a field not in the user model', (done) => {
        userService.createUser(extraFakeFieldUser)
        .catch((err) => {
          expect(err.name).to.equal('ValidationError');
          expect(err.details[0].message).to.equal('"notAField" is not allowed');
          done();
        });
      });

      it('should fail validation with a field not allowed', (done) => {
        userService.createUser(extraFieldUser)
        .catch((err) => {
          expect(err.name).to.equal('ValidationError');
          expect(err.details[0].message).to.equal('"role" is not allowed');
          done();
        });
      });
    });
  });

  describe('# getUser()', () => {
    let savedUserId;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          savedUserId = createdUser.id;
          done();
        });
    });

    it('gets an existing user', (done) => {
      userService.getUser(savedUserId)
        .then((user) => {
          expect(user).to.exist;
          expect(user.id).to.equal(savedUserId);
          expect(user.name).to.equal('Jarryd');
          expect(user.email).to.equal('abc@google.com');
          expect(user.role).to.equal(0);
          expect(user.auth).to.be.null;
          expect(user.escalationPolicy).to.be.null;
          expect(user.groups).to.be.empty;
          expect(user.devices).to.be.empty;
          expect(user.createdAt).to.be.not.null;
          done();
        });
    });

    it('can\'t find user for a given userId', (done) => {
      userService.getUser('000000000000000000000000')
        .catch((err, user) => {
          expect(err).to.exist;
          expect(err.status).to.equal(httpStatus.NOT_FOUND);
          done();
        });
    });
  });

  describe('# updateUser()', () => {
    let savedUserId;

    const updateDetails = {
      role: 1,
      email: 'update@email.com',
    };

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          savedUserId = createdUser.id;
          done();
        });
    });

    it('updates an existing user', (done) => {
      userService.updateUser(savedUserId, updateDetails)
        .then((user) => {
          expect(user).to.exist;
          expect(user.id).to.equal(savedUserId);
          expect(user.name).to.equal(baseUser.name);
          expect(user.email).to.equal(updateDetails.email);
          expect(user.role).to.equal(updateDetails.role);
          expect(user.auth).to.be.null;
          expect(user.escalationPolicy).to.be.null;
          expect(user.groups).to.be.empty;
          expect(user.devices).to.be.empty;
          expect(user.createdAt).to.be.not.null;
          done();
        });
    });

    it('fails to update a user with invalid fields', (done) => {
      userService.updateUser(savedUserId, { fake: 0 })
        .catch((err, user) => {
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          expect(err.details[0].message).to.equal('"fake" is not allowed');
          done();
        });
    });
  });

  describe('# deleteUser()', () => {
    let savedUserId;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          savedUserId = createdUser.id;
          done();
        });
    });

    it('should delete a user', (done) => {
      userService.deleteUser(savedUserId)
        .then(() => {
          userService.getUser(savedUserId)
            .catch((err, user) => {
              expect(err).to.exist;
              expect(err.status).to.equal(httpStatus.NOT_FOUND);
              done();
            });
        });
    });

    it('should fail to delete user that doesn\'t exist', (done) => {
      userService.deleteUser(savedUserId)
        .catch((err) => {
          expect(err).to.exist;
          expect(err.status).to.equal(httpStatus.NOT_FOUND);
          done();
        });
    });
  });

  describe('# addDevice() | getDevice()', () => {
    let user;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should add and retrieve a users device', (done) => {
      userService.addDevice(user, baseDevice, 0)
        .then(savedUser => savedUser.getDevice(savedUser.devices[0].id))
        .then((retrievedDevice) => {
          expect(retrievedDevice.name).to.equal(baseDevice.name);
          expect(retrievedDevice.type).to.equal(baseDevice.type);
          expect(retrievedDevice.contactInformation).to.equal(baseDevice.contactInformation);
          done();
        });
    });

    it('should fail to add device without all fields', (done) => {
      userService.addDevice(user, { name: 'test' }, 0)
        .catch((err) => {
          expect(err.details[0].message).to.equal('"type" is required');
          done();
        });
    });

    it('should fail to retrieve a users device with incorrect deviceId', (done) => {
      const fakeId = '1234567890abcdef123456789';
      userService.getDevice(user, fakeId)
        .catch((err) => {
          expect(err).to.exist;
          expect(err.message).to.equal(`Device with ID ${fakeId} doesn\'t exist!`);
          done();
        });
    });
  });

  describe('# removeDevice()', () => {
    const device = new Device(baseDevice);

    let user;

    before((done) => {
      userService.createUser(baseUser)
        .then(createdUser => createdUser.addDevice(device, 0))
        .then((updatedUser) => {
          user = updatedUser;
          done();
        });
    });

    it('should remove a device from the user', (done) => {
      userService.removeDevice(user, device.id)
        .then((updatedUser) => {
          expect(updatedUser).to.exist;
          expect(updatedUser.devices).to.be.empty;
          done();
        });
    });
  });

  describe('# updateDevice()', () => {
    const device = new Device(baseDevice);

    const updateDetails = {
      name: 'sms',
      type: 'sms'
    };

    let user;

    beforeEach((done) => {
      userService.createUser(baseUser)
        .then(createdUser => createdUser.addDevice(device, 0))
        .then((updatedUser) => {
          user = updatedUser;
          done();
        });
    });

    it('should update a device', (done) => {
      userService.updateDevice(user, device.id, updateDetails)
        .then((updatedUser) => {
          const updatedDevice = updatedUser.devices[0];
          expect(updatedDevice.name).to.equal(updateDetails.name);
          expect(updatedDevice.type).to.equal(updateDetails.type);
          done();
        });
    });

    it('should fail to update with ValidationError', (done) => {
      userService.updateDevice(user, device.id, { fake: 'fake' })
        .catch((err) => {
          expect(err.details[0].message).to.equal('"fake" is not allowed');
          done();
        });
    });
  });

  describe('# sortDevices()', () => {
    const device1 = new Device(baseDevice);
    const device2 = new Device(baseDevice);
    const device3 = new Device(baseDevice);
    const sortOrder = [device1.id, device2.id, device3.id];

    let user;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          user = createdUser;
          return Promise.all([
            createdUser.addDevice(device2, 0),
            createdUser.addDevice(device1, 0),
            createdUser.addDevice(device3, 0)
          ]);
        })
        .then(() => User.get(user.id))
        .then((receivedUser) => {
          user = receivedUser;
          done();
        });
    });

    it('should sort a users device order by a given list', (done) => {
      userService.sortDevices(user, sortOrder)
        .then((receivedUser) => {
          expect(receivedUser).to.exist;
          const userDevices = receivedUser.devices;
          for (let i = 0; i < sortOrder.length; i += 1) {
            expect(userDevices[i].id).to.equal(sortOrder[i]);
          }
          done();
        });
    });
  });

  describe('# addGroup', () => {
    const baseGroup = {
      name: 'Wondertwins'
    };

    let user;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should add a group name to the user', (done) => {
      userService.addGroupByUserId(user.id, baseGroup.name)
        .then((modifiedUser) => {
          expect(modifiedUser).to.exist;
          expect(modifiedUser.name).to.equal(baseUser.name);
          expect(modifiedUser.groups).to.include(baseGroup.name);
          done();
        });
    });

    it('should return an error if the group name is not a string', (done) => {
      userService.addGroupByUserId(user.id, [1, 2, 3])
        .catch((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          done();
        });
    });
  });

  describe('# removeGroup', () => {
    const baseGroup = {
      name: 'Wondertwins'
    };

    let user;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should remove a group name from the user', (done) => {
      userService.removeGroup(user, baseGroup.name)
        .then((modifiedUser) => {
          expect(modifiedUser).to.exist;
          expect(modifiedUser.name).to.equal(baseUser.name);
          expect(modifiedUser.groups).to.not.include(baseGroup.name);
          done();
        });
    });

    it('should return an error if the group name is not a string', (done) => {
      userService.removeGroup(user, [1, 2, 3])
        .catch((err) => {
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          done();
        });
    });
  });

  describe('# getGroupsForUser', () => {
    let user;
    context('given a user with many groups', () => {
      let groups;

      before((done) => {
        buildUserAndGroups().then((values) => {
          user = values.user;
          groups = values.groups;
          done();
        });
      });

      it('returns all of the groups', (done) => {
        userService.getGroupsForUser(user)
          .then((response) => {
            expect(response.groups.length).to.equal(groups.length);
            for (let i = 0; i < response.groups.length; i += 1) {
              expect(response.groups[i].name).to.equal(groups[i].name);
            }
            done();
          });
      });
    });

    context('given a user with no groups', () => {
      before((done) => {
        userService.createUser(baseUser);
        build('user', baseUser)
          .then((createdUser) => {
            user = createdUser;
            done();
          });
      });

      it('returns no groups', (done) => {
        userService.getGroupsForUser(user)
          .then((response) => {
            expect(response.groups).to.be.empty;
            done();
          });
      });
    });
  });
});
