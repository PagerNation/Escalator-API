import User from '../../models/user';
import Device from '../../models/device';

describe('# User Model', () => {
  describe('user creation', () => {
    let user = new User({
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

    it("throws an error when the email is not valid", (done) => {
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

  describe('user devices modifications', () => {
    let user = new User({
      name: 'Kaleb Davis',
      email: 'abc@google.com'
    });

    const newDevice = new Device({
      name: 'home phone',
      type: 'phone',
      contactInformation: '5555555555'
    });

    before((done) => {
      User.create(user)
        .then((createdUser) => {
          expect(createdUser).to.exist;
          user = createdUser;
          done();
        });
    });

    it('should add a device to the user', (done) => {
      user.devices.push(newDevice);
      user.markModified('devices');

      user.save()
        .then(() => {
          User.get(user._id)
            .then((receivedUser) => {
              expect(receivedUser).to.exist;
              expect(receivedUser.devices[0]._id.toString()).to.equal(newDevice._id.toString());
              expect(receivedUser.devices[0].name).to.equal(newDevice.name);
              expect(receivedUser.devices[0].type).to.equal(newDevice.type);
              expect(receivedUser.devices[0].contactInformation).to
                .equal(newDevice.contactInformation);
              done();
            });
        });
    });
  });
});
