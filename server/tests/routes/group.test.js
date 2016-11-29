import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import { fixtures, build } from '../factories';
import User from '../../models/user';

const groupUrl = '/api/v1/group';

describe('## Group API', () => {
  context('with no groups needed beforehand', () => {
    describe('# POST /api/v1/group', () => {
      context('with a valid group', () => {
        const group = fixtures.group();

        it('should create a new group', (done) => {
          request(app)
            .post(groupUrl)
            .send(group)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              expect(res.body.users[0]).to.equal(group.users[0]);
              done();
            });
        });
      });

      context('with an invalid group', () => {
        const group = {
          name: 1,
          users: []
        };

        it('should not create a new group', (done) => {
          request(app)
            .post(groupUrl)
            .send(group)
            .expect(httpStatus.BAD_REQUEST)
            .then(() => done());
        });
      });
    });
  });

  context('with a group needed beforehand', () => {
    context('with a valid group', () => {
      const group = fixtures.group({
        users: ['5c15f987046b1686d22dbea1', 'ba421976ad9b71458d8b91ab']
      });

      beforeEach((done) => {
        build('group', group)
          .then(() => done());
      });


      describe('# GET /api/v1/group/:groupName', () => {
        it('should get a group', (done) => {
          request(app)
            .get(`${groupUrl}/${group.name}`)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              done();
            });
        });
      });

      describe('# PUT /api/v1/group/:groupName', () => {
        const updateDetails = {
          users: ['a403e1675e8bc2b1cb409a1b', '16092d4636c645db67a61f83']
        };

        it('should update the group details', (done) => {
          request(app)
            .put(`${groupUrl}/${group.name}`)
            .send(updateDetails)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.users[0].toString()).to.equal(updateDetails.users[0]);
              expect(res.body.users[1].toString()).to.equal(updateDetails.users[1]);
              done();
            });
        });
      });

      describe('# PUT /api/v1/group/:groupName', () => {
        it('should report error with message for any invalid field', (done) => {
          request(app)
            .put(`${groupUrl}/${group.name}`)
            .send({ notakey: 'notavalue' })
            .expect(httpStatus.BAD_REQUEST)
            .then((res) => {
              expect(res.body.message).to.equal('"notakey" is not allowed');
              done();
            });
        });
      });

      describe('# DELETE /api/v1/group/:groupName', () => {
        it('deletes the group', (done) => {
          request(app)
            .delete(`${groupUrl}/${group.name}`)
            .expect(httpStatus.OK)
            .then(() => {
              request(app)
                .get(`${groupUrl}/${group.name}`)
                .expect(httpStatus.NOT_FOUND)
                .then(() => done());
            });
        });
      });

      describe('# POST /api/v1/group/:groupName/user', () => {
        let user;

        before((done) => {
          build('user', fixtures.user())
            .then((newUser) => {
              user = newUser;
              done();
            });
        });

        it('should add a user to the group', (done) => {
          request(app)
            .post(`${groupUrl}/${group.name}/user`)
            .send({ userId: user.id })
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              expect(res.body.users).to.include(user.id);
            })
            .then(() => User.get(user.id))
            .then((updatedUser) => {
              expect(updatedUser.groups).to.include(group.name);
              done();
            });
        });
      });

      describe('# DELETE /api/v1/group/:groupName/user/:userId', () => {
        const data = {
          userId: group.users[0]
        };

        it('should remove the user from the group', (done) => {
          request(app)
            .delete(`${groupUrl}/${group.name}/user/${data.userId}`)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              expect(res.body.users).to.not.include(data.userId);
              done();
            });
        });

        it('should not remove a user that does not exist', (done) => {
          request(app)
            .delete(`${groupUrl}/${group.name}/user/098765432109876543210987`)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              expect(res.body.users).to.include(group.users[0]);
              done();
            });
        });
      });
    });

    context('with an invalid group', () => {
      const group = {
        name: 1,
        users: []
      };

      describe('# GET /api/v1/group/:groupName', () => {
        it('should fail with an error message', (done) => {
          request(app)
            .get(`${groupUrl}/doesNotExist`)
            .expect(httpStatus.NOT_FOUND)
            .then((res) => {
              expect(res.body.message).to.equal('Not Found');
              done();
            });
        });
      });


      describe('# DELETE /api/v1/group/:groupName', () => {
        it('should report an error', (done) => {
          request(app)
            .delete(`${groupUrl}/doesNotExist`)
            .expect(httpStatus.NOT_FOUND)
            .then((res) => {
              expect(res.body.message).to.equal('Not Found');
              done();
            });
        });
      });
    });
  });
});
