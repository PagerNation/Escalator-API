import User from '../../models/user';
import Device from '../../models/device';
import Group from '../../models/group';
import { build, fixtures } from '../../utils/factories';

describe('## User Model', () => {
  describe('# user creation', () => {
    const user = new User({
      name: 'Kaleb Davis',
      email: 'abc@google.com'
    });

    it('creates a user', (done) => {
      User.create(user, (err, u) => {
        expect(err).to.not.exist;
        expect(u.name).to.equal(user.name);
        expect(u.email).to.equal(user.email);
        expect(u.role).to.equal(user.role);
        done();
      });
    });

    it('throws an error when the email is not valid', (done) => {
      const badEmail = 'hello';
      user.email = badEmail;
      User.create(user, (err, u) => {
        expect(err).to.exist;
        expect(err.errors.email.message).to.equal(`${badEmail} is not a valid email address`);
        done();
      });
    });

    it("throws an error when a required field doesn't exist", (done) => {
      user.name = null;
      User.create(user, (err, u) => {
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('# user devices modifications', () => {
    const baseUser = {
      name: 'Kaleb Davis',
      email: 'abc@google.com'
    };

    const newDevice = new Device({
      name: 'home phone',
      type: 'phone',
      contactInformation: '5555555555'
    });

    let user;

    beforeEach((done) => {
      build('user', baseUser)
        .then((createdUser) => {
          expect(createdUser).to.exist;
          user = createdUser;
          done();
        });
    });

    it('should add a device to the user', (done) => {
      user.addDevice(newDevice, 0)
        .then((receivedUser) => {
          expect(receivedUser).to.exist;
          expect(receivedUser.devices[0].id).to.equal(newDevice.id);
          done();
        });
    });

    it('should remove a device from the user', (done) => {
      user.addDevice(newDevice, 0)
        .then((receivedUser) => {
          expect(receivedUser).to.exist;
          expect(receivedUser.devices[0].id).to.equal(newDevice.id);
        })
        .then(() => user.removeDevice(newDevice.id))
        .then((receivedUser) => {
          expect(receivedUser).to.exist;
          expect(receivedUser.devices).to.be.empty;
          done();
        });
    });

    it('should get a device from the user', (done) => {
      user.addDevice(newDevice, 0)
        .then(() => user.getDevice(newDevice.id))
        .then((device) => {
          expect(device).to.exist;
          expect(device.name).to.equal(newDevice.name);
          expect(device.type).to.equal(newDevice.type);
          expect(device.contactInformation).to.equal(newDevice.contactInformation);
          expect(device.id).to.equal(newDevice.id);
          done();
        });
    });

    it('should update a device on a user', (done) => {
      const updateDetails = {
        name: 'telephone',
        contactInformation: '+123456789'
      };

      user.addDevice(newDevice, 0)
        .then(updatedUser => updatedUser.updateDevice(newDevice.id, updateDetails))
        .then((updatedUser) => {
          const updatedDevice = updatedUser.devices[0];
          expect(updatedDevice.name).to.equal(updateDetails.name);
          expect(updatedDevice.contactInformation).to.equal(updateDetails.contactInformation);
          expect(updatedDevice.type).to.equal(newDevice.type);
          done();
        });
    });

    it('should fail to update with an invalid device type', (done) => {
      user.addDevice(newDevice, 0)
        .then(updatedUser => updatedUser.updateDevice(newDevice.id, { type: 'false' }))
        .catch((err) => {
          expect(err.errors['devices.0.type'].message)
            .to.equal('`false` is not a valid enum value for path `type`.');
          done();
        });
    });

    it('should sort a users devices by a given order', (done) => {
      const sortDevice1 = new Device({
        name: 'mobile',
        type: 'sms',
        contactInformation: '5555555555'
      });

      const sortDevice2 = new Device({
        name: 'home email',
        type: 'email',
        contactInformation: 'j@l.com'
      });

      const sortOrder = [newDevice.id, sortDevice2.id, sortDevice1.id];

      user.addDevice(sortDevice1)
        .then(() => user.addDevice(sortDevice2))
        .then(() => user.addDevice(newDevice))
        .then(() => user.sortDevices(sortOrder))
        .then(() => User.get(user.id))
        .then((receivedUser) => {
          expect(receivedUser).to.exist;

          const userDevices = receivedUser.devices;
          for (let i = 0; i < sortOrder.length; i += 1) {
            expect(userDevices[i].id).to.equal(sortOrder[i]);
          }
          done();
        });
    });

    it('should return a 404 when a device doesn\'t exist', (done) => {
      const fakeId = '123456789abcdef123456789';
      user.getDevice(fakeId)
        .catch((err) => {
          expect(err).to.exist;
          expect(err.message).to.equal(`Device with ID ${fakeId} doesn\'t exist!`);
          done();
        });
    });
  });

  describe('# user group modifications', () => {
    const userDetails = {
      name: 'Bryon Wilkins',
      email: '123@google.com'
    };

    const group = {
      name: 'Wondertwins'
    };

    let createdUser;

    beforeEach((done) => {
      User.create(new User(userDetails))
        .then((updatedUser) => {
          createdUser = updatedUser;
          done();
        });
    });

    it('should add a group to the user', (done) => {
      createdUser.addGroup(group.name)
        .then((modifiedUser) => {
          expect(modifiedUser).to.exist;
          expect(modifiedUser.groups[0]).to.equal(group.name);
          done();
        });
    });

    it('should remove a group from the user', (done) => {
      createdUser.addGroup(group.name)
        .then((modifiedUser) => {
          expect(modifiedUser.groups[0]).to.exist;
        })
        .then(() => createdUser.removeGroup(group.name))
        .then((receivedUser) => {
          expect(receivedUser).to.exist;
          expect(receivedUser.devices).to.be.empty;
          done();
        });
    });
  });
});
