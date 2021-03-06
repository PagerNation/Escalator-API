import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import authService from '../../services/auth';
import { build, buildAndAuth, fixtures } from '../../utils/factories';
import Device from '../../models/device';
import { buildUserAndGroups } from '../helpers/userHelper';

const userUrl = '/api/v1/user';

describe('## User APIs', () => {
  const baseUser = fixtures.user();
  const baseDevice = fixtures.emailDevice();

  let token;

  describe('# POST /api/v1/user', () => {
    const invalidUser = fixtures.user({ email: 1 });
    const userObj = fixtures.user();

    beforeEach((done) => {
      build('user', userObj)
        .then(u => authService.loginUser(u.email))
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('should create a new user', (done) => {
      request(app)
        .post(userUrl)
        .set('Authorization', `Bearer ${token}`)
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
        .post(userUrl)
        .set('Authorization', `Bearer ${token}`)
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
      build('group', fixtures.group())
        .then(group => build('user', fixtures.user({ groups: [group.name] })))
        .then((u) => {
          user = u;
          return authService.loginUser(u.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('should get a user', (done) => {
      request(app)
        .get(`${userUrl}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(user.name);
          expect(res.body.email).to.equal(user.email);
          expect(res.body.groups[0].name).to.equal(user.groups[0]);
          done();
        });
    });

    it('should report error with message - Not found, when user does not exist', (done) => {
      request(app)
        .get(`${userUrl}/56c787ccc67fc16ccc1a5e92`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });

  describe('# PUT /api/v1/user/:userId', () => {
    let user;
    let userAndToken;

    const newEmail = {
      email: 'update@email.com',
    };

    beforeEach((done) => {
      build('user', baseUser)
        .then((createdUser) => {
          user = createdUser;
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('should update user details', (done) => {
      request(app)
        .put(`${userUrl}/${user.id}`)
        .send(newEmail)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(newEmail.email);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`${userUrl}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ fake: 0 })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"fake" is not allowed');
          done();
        });
    });

    it('should report error with message for a field that should not be updated', (done) => {
      request(app)
        .put(`${userUrl}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ devices: [{}] })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"devices" is not allowed');
          done();
        });
    });

    context('when updating escalation policy fields', () => {
      const delays = [1, 2, 3, 4, 5];
      const newDelays = {
        delays
      };

      it('should update the escalation policy', (done) => {
        request(app)
          .put(`${userUrl}/${user.id}`)
          .send(newDelays)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.delays[0]).to.equal(delays[0]);
            expect(res.body.delays[1]).to.equal(delays[1]);
            done();
          });
      });
    });

    context('with an admin user', () => {
      before((done) => {
        buildAndAuth('user', fixtures.user({ isSysAdmin: true }))
          .then((u) => {
            userAndToken = u;
            done();
          });
      });

      it('should update a user\'s role', (done) => {
        request(app)
          .put(`${userUrl}/${userAndToken.user.id}`)
          .set('Authorization', `Bearer ${userAndToken.token}`)
          .send({ isSysAdmin: false })
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.isSysAdmin).to.equal(false);
            done();
          });
      });
    });

    context('without an admin user', () => {
      before((done) => {
        buildAndAuth('user', fixtures.user())
          .then((u) => {
            userAndToken = u;
            done();
          });
      });

      it('should fail fail to update a users role', (done) => {
        request(app)
          .put(`${userUrl}/${userAndToken.user.id}`)
          .set('Authorization', `Bearer ${userAndToken.token}`)
          .send({ isSysAdmin: false })
          .expect(httpStatus.BAD_REQUEST)
          .then((res) => {
            expect(res.body.message).to.equal('"isSysAdmin" is not allowed');
            done();
          });
      });
    });
  });

  describe('# DELETE /api/v1/user/:userId', () => {
    let user;

    before((done) => {
      build('user', baseUser)
        .then((createdUser) => {
          user = createdUser;
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('deletes a user', (done) => {
      request(app)
        .delete(`${userUrl}/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`${userUrl}/${user.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .delete(`${userUrl}/56c787ccc67fc16ccc1a5e92`)
        .set('Authorization', `Bearer ${token}`)
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
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('should get a device from the user', (done) => {
      request(app)
        .get(`${userUrl}/${user.id}/device/${device.id}`)
        .set('Authorization', `Bearer ${token}`)
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

    const deviceUpdates = {
      name: 'new name',
      type: 'sms',
    };

    beforeEach((done) => {
      build('user', baseUser)
        .then(createdUser => createdUser.addDevice(new Device(baseDevice), 0))
        .then((updatedUser) => {
          user = updatedUser;
          device = user.devices[0];
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('should update a device', (done) => {
      request(app)
        .put(`${userUrl}/${user.id}/device/${device.id}`)
        .send(deviceUpdates)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          const updatedDevice = res.body.devices[0];
          expect(updatedDevice.name).to.equal(deviceUpdates.name);
          expect(updatedDevice.type).to.equal(deviceUpdates.type);
          expect(updatedDevice.contactInformation).to.equal(device.contactInformation);
          done();
        });
    });

    it('should fail validation with an invalid device type', (done) => {
      request(app)
        .put(`${userUrl}/${user.id}/device/${device.id}`)
        .set('Authorization', `Bearer ${token}`)
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
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    it('should add a device to the user', (done) => {
      request(app)
        .post(`${userUrl}/${user.id}/device`)
        .set('Authorization', `Bearer ${token}`)
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
        .post(`${userUrl}/${user.id}/device`)
        .set('Authorization', `Bearer ${token}`)
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

  describe('# GET / api/v1/user/:userId/group', () => {
    context('when the user is in one or more group', () => {
      let user;
      let groups;

      before((done) => {
        buildUserAndGroups().then((values) => {
          user = values.user;
          groups = values.groups;
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
      });

      it('returns all of the groups that a user is in', (done) => {
        request(app)
          .get(`${userUrl}/${user.id}/group`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            const groupsResponse = res.body.groups;
            expect(groupsResponse.length).to.equal(groups.length);
            for (let i = 0; i < groupsResponse.length; i++) {
              expect(groupsResponse[i].name).to.equal(groups[i].name);
            }
            done();
          });
      });
    });

    context('when the user is not in any group', () => {
      let user;
      before((done) => {
        build('user', baseUser).then((u) => {
          user = u;
          return authService.loginUser(user.email);
        })
        .then((authObject) => {
          token = authObject.token;
          done();
        });
      });

      it('returns an empty array of groups', (done) => {
        request(app)
          .get(`${userUrl}/${user.id}/group`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.groups).to.be.empty;
            done();
          });
      });
    });

    context('when there is no user', () => {
      const badId = 'abc123';

      it('returns a bad request', (done) => {
        request(app)
          .get(`${userUrl}/${badId}/group`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.NOT_FOUND)
          .then((res) => {
            done();
          });
      });
    });
  });
});
