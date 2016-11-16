import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import userService from '../../services/user';
import { build, fixtures } from '../factories';
import Device from '../../models/device';


describe('## User APIs', () => {
  const baseUser = fixtures.user();
  const baseDevice = fixtures.emailDevice();

  describe('# POST /api/v1/user', () => {
    const invalidUser = fixtures.user({ email: 1 });

    it('should create a new user', (done) => {
      request(app)
        .post('/api/v1/user')
        .send(baseUser)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(baseUser.name);
          expect(res.body.email).to.equal(baseUser.email);
          done();
        });
    });

    it('should fail with status 400 with invalid userObject', (done) => {
      request(app)
        .post('/api/v1/user')
        .send(invalidUser)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"email" must be a string');
          done();
        });
    });
  });

  describe('# GET /api/v1/user/:userId', () => {
    let user;

    before((done) => {
      build('user', baseUser)
        .then((u) => {
          user = u;
          done();
        });
    });

    it('should get a user', (done) => {
      request(app)
        .get(`/api/v1/user/${user.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(user.name);
          expect(res.body.email).to.equal(user.email);
          done();
        });
    });

    it('should report error with message - Not found, when user does not exist', (done) => {
      request(app)
        .get('/api/v1/user/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });

  describe('# PUT /api/v1/user/:userId', () => {
    let user;

    const updateDetails = {
      email: 'update@email.com'
    };

    beforeEach((done) => {
      build('user', baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should update user details', (done) => {
      request(app)
        .put(`/api/v1/user/${user.id}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(updateDetails.email);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`/api/v1/user/${user.id}`)
        .send({ fake: 0 })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"fake" is not allowed');
          done();
        });
    });
  });

  describe('# DELETE /api/v1/user/:userId', () => {
    let user;

    before((done) => {
      build('user', baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('deletes a user', (done) => {
      request(app)
        .delete(`/api/v1/user/${user.id}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`/api/v1/user/${user.id}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .delete('/api/v1/user/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });

  describe('# GET /api/v1/user/:userId/device/:deviceId', () => {
    const device = new Device(fixtures.emailDevice());

    let user;

    before((done) => {
      build('user', baseUser)
        .then(createdUser => createdUser.addDevice(device))
        .then((updatedUser) => {
          user = updatedUser;
          done();
        });
    });

    it('should get a device from the user', (done) => {
      request(app)
        .get(`/api/v1/user/${user.id}/device/${device.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(device.email);
          expect(res.body.type).to.equal(device.type);
          expect(res.body.contactInformation).to.equal(device.contactInformation);
          done();
        });
    });
  });

  describe('# PUT /api/v1/user/:userId/device/:deviceId', () => {
    let user;
    let device;

    const updateDetails = {
      name: 'new name',
      type: 'sms',
    };

    beforeEach((done) => {
      build('user', baseUser)
        .then(createdUser => createdUser.addDevice(new Device(baseDevice), 0))
        .then((updatedUser) => {
          user = updatedUser;
          device = user.devices[0];
          done();
        });
    });

    it('should update a device', (done) => {
      request(app)
        .put(`/api/v1/user/${user.id}/device/${device.id}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          const updatedDevice = res.body.devices[0];
          expect(updatedDevice.name).to.equal(updateDetails.name);
          expect(updatedDevice.type).to.equal(updateDetails.type);
          expect(updatedDevice.contactInformation).to.equal(device.contactInformation);
          done();
        });
    });

    it('should fail validation with an invalid device type', (done) => {
      request(app)
        .put(`/api/v1/user/${user.id}/device/${device.id}`)
        .send({ type: 'invalid' })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"type" must be one of [email, phone, sms]');
          done();
        });
    });
  });

  describe('# POST /api/v1/user/:userId/device', () => {
    let user;

    beforeEach((done) => {
      build('user', baseUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should add a device to the user', (done) => {
      request(app)
        .post(`/api/v1/user/${user.id}/device`)
        .send({
          device: baseDevice,
          index: 0
        })
        .expect(httpStatus.OK)
        .then((res) => {
          const device = res.body.devices[0];
          expect(device.email).to.equal(baseDevice.email);
          expect(device.type).to.equal(baseDevice.type);
          expect(device.contactInformation).to.equal(baseDevice.contactInformation);
          done();
        });
    });

    it('should throw validation error if body is invalid', (done) => {
      request(app)
        .post(`/api/v1/user/${user.id}/device`)
        .send({
          device: baseDevice
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"index" is required');
          done();
        });
    });
  });
});
