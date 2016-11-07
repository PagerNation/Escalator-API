import httpStatus from 'http-status';
import userService from '../../services/user';
import User from '../../models/user';
import Device from '../../models/device';

describe('## User Service', () => {
  const userObject = {
    name: 'Jarryd',
    email: 'abc@google.com'
  };

  // Create
  describe('# createUser()', () => {
    context('with valid user details', () => {
      it('creates a new user', (done) => {
        userService.createUser(userObject)
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

  // Get
  describe('# getUser()', () => {
    let savedUserId;

    before((done) => {
      userService.createUser(userObject)
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

  // Update
  describe('# updateUser()', () => {
    let savedUserId;

    const updateDetails = {
      role: 1,
      email: 'update@email.com',
    };

    before((done) => {
      userService.createUser(userObject)
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
          expect(user.name).to.equal('Jarryd');
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

  // Delete
  describe('# deleteUser()', () => {
    let savedUserId;

    before((done) => {
      userService.createUser(userObject)
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
    const baseUser = {
      name: 'Jarryd Lee',
      email: 'Jarryd@lee.com'
    };

    const device = new Device({
      name: 'email',
      type: 'email',
      contactInformation: '1234567890'
    });

    let user;

    before((done) => {
      userService.createUser(baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should add and retrieve a users device', (done) => {
      user.addDevice(device, 0)
        .then(savedUser => savedUser.getDevice(device.id))
        .then((retrievedDevice) => {
          expect(retrievedDevice.name).to.equal(device.name);
          expect(retrievedDevice.type).to.equal(device.type);
          expect(retrievedDevice.contactInformation).to.equal(device.contactInformation);
          done();
        });
    });

    it('should fail to retrieve a users device with incorrect deviceId', (done) => {
      const fakeId = '1234567890abcdef123456789';
      user.getDevice(fakeId)
        .catch((err) => {
          expect(err).to.exist;
          expect(err.message).to.equal(`Device with ID ${fakeId} doesn\'t exist!`);
          done();
        });
    });
  });


  describe('# removeDevice()', () => {
    const baseUser = {
      name: 'Jarryd Lee',
      email: 'Jarryd@lee.com'
    };

    const device = new Device({
      name: 'email',
      type: 'email',
      contactInformation: '1234567890'
    });

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

  describe('# sortDevices()', () => {
    const baseUser = {
      name: 'Jarryd Lee',
      email: 'Jarryd@lee.com'
    };

    const baseDevice = {
      name: 'email',
      type: 'email',
      contactInformation: '1234567890'
    };

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
});
