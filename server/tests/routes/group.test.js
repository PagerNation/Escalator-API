import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import { fixtures, build, buildAndAuth, uuid } from '../../utils/factories';
import authService from '../../services/auth';
import userService from '../../services/user';
import User from '../../models/user';

const groupUrl = '/api/v1/group';

describe('## Group API', () => {
  let user;
  let token;

  beforeEach((done) => {
    user = fixtures.user();
    buildAndAuth('user', user)
      .then((authObject) => {
        token = authObject.token;
        done();
      });
  });

  context('with a required admin user', () => {
    beforeEach((done) => {
      const authUser = fixtures.user({ isSysAdmin: true });
      buildAndAuth('user', authUser)
        .then((authObject) => {
          token = authObject.token;
          done();
        });
    });

    describe('#POST /api/v1/group', () => {
      context('with a valid group', () => {
        const group = fixtures.group();

        it('should create a new group', (done) => {
          request(app)
            .post(groupUrl)
            .set('Authorization', `Bearer ${token}`)
            .send(group)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
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
            .set('Authorization', `Bearer ${token}`)
            .send(group)
            .expect(httpStatus.BAD_REQUEST)
            .then(() => done());
        });
      });
    });
  });

  context('with a normal user', () => {
    let group;

    beforeEach((done) => {
      buildAndAuth('user', fixtures.user())
        .then((authObject) => {
          token = authObject.token;
          user = authObject.user;
          done();
        });
    });

    context('with a valid group', () => {
      beforeEach((done) => {
        build('group', fixtures.group())
          .then((g) => {
            group = g;
            done();
          });
      });

      describe('# GET /api/v1/group/:groupName', () => {
        it('should get a group', (done) => {
          request(app)
            .get(`${groupUrl}/${group.name}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              done();
            });
        });
      });
    });

    context('with an invalid group', () => {
      group = {
        name: 1,
        users: []
      };

      describe('# GET /api/v1/group/:groupName', () => {
        it('should fail with an error message', (done) => {
          request(app)
            .get(`${groupUrl}/doesNotExist`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.NOT_FOUND)
            .then((res) => {
              expect(res.body.message).to.equal('Not Found');
              done();
            });
        });
      });
    });
  });

  context('with a group admin', () => {
    let group;

    beforeEach((done) => {
      buildAndAuth('user', fixtures.user())
        .then((authObject) => {
          token = authObject.token;
          user = authObject.user;
          done();
        });
    });

    context('with a valid group', () => {
      beforeEach((done) => {
        build('group', fixtures.group({
          admins: [user]
        }))
        .then((createdGroup) => {
          group = createdGroup;
          done();
        });
      });


      describe('# PUT /api/v1/group/:groupName', () => {
        it('should update the group details', (done) => {
          request(app)
            .put(`${groupUrl}/${group.name}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ users: [user.id] })
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.users[0]._id).to.equal(user.id);
              done();
            });
        });
      });

      describe('# PUT /api/v1/group/:groupName', () => {
        it('should report error with message for any invalid field', (done) => {
          request(app)
            .put(`${groupUrl}/${group.name}`)
            .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.OK)
            .then(() => {
              request(app)
                .get(`${groupUrl}/${group.name}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(httpStatus.NOT_FOUND)
                .then(() => done());
            });
        });
      });

      describe('# POST /api/v1/group/:groupName/user', () => {
        it('should add a user to the group', (done) => {
          request(app)
            .post(`${groupUrl}/${group.name}/user`)
            .set('Authorization', `Bearer ${token}`)
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
        let userToBeDeleted;

        beforeEach((done) => {
          build('user', fixtures.user())
            .then((u) => {
              userToBeDeleted = u;
              return build('group', fixtures.group({
                users: [userToBeDeleted.id],
                admins: [user.id]
              }));
            })
            .then((g) => {
              group = g;
              done();
            });
        });

        it('should remove the user from the group', (done) => {
          request(app)
            .delete(`${groupUrl}/${group.name}/user/${userToBeDeleted.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              expect(res.body.users).to.not.include(userToBeDeleted.id);
              done();
            });
        });

        it('should remove the group from the associated user', (done) => {
          request(app)
            .delete(`${groupUrl}/${group.name}/user/${userToBeDeleted.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.OK)
            .then(() => userService.getUser(userToBeDeleted.id))
            .then((receivedUser) => {
              expect(receivedUser.groups).to.not.include(group.name);
              done();
            });
        });

        it('should not remove a user that does not exist', (done) => {
          request(app)
            .delete(`${groupUrl}/${group.name}/user/098765432109876543210987`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.OK)
            .then((res) => {
              expect(res.body.name).to.equal(group.name);
              expect(res.body.users).to.include(group.users[0].toString());
              done();
            });
        });
      });
    });

    context('with an invalid group', () => {
      group = {
        name: 1,
        users: []
      };

      describe('# DELETE /api/v1/group/:groupName', () => {
        it('should report an error', (done) => {
          request(app)
            .delete(`${groupUrl}/doesNotExist`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.NOT_FOUND)
            .then((res) => {
              expect(res.body.message).to.equal('Not Found');
              done();
            });
        });
      });
    });
  });


  describe('# POST /api/v1/group/:groupName/user/:userId/admin', () => {
    let groupAdminUserAndToken;
    let adminUserAndToken;
    let userAndToken;
    let group;

    beforeEach((done) => {
      const groupAdminUserBuild = buildAndAuth('user', fixtures.user())
        .then(createdUserAndToken => (groupAdminUserAndToken = createdUserAndToken));
      const adminUserBuild = buildAndAuth('user', fixtures.user({ isSysAdmin: true }))
        .then(createdUserAndToken => (adminUserAndToken = createdUserAndToken));
      const userBuild = buildAndAuth('user', fixtures.user())
        .then(createdUserAndToken => (userAndToken = createdUserAndToken));

      Promise.all([groupAdminUserBuild, adminUserBuild, userBuild])
        .then(values => build('group', fixtures.group({ admins: [values[0].user.id] })))
        .then((g) => {
          group = g;
          done();
        });
    });

    context('with group admin permissions', () => {
      it('adds a new admin', (done) => {
        request(app)
          .post(`${groupUrl}/${group.name}/user/${userAndToken.user.id}/admin`)
          .set('Authorization', `Bearer ${groupAdminUserAndToken.token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.admins).to.include(userAndToken.user.id);
            done();
          });
      });
    });

    context('with admin permissions', () => {
      it('adds a new admin', (done) => {
        request(app)
          .post(`${groupUrl}/${group.name}/user/${userAndToken.user.id}/admin`)
          .set('Authorization', `Bearer ${adminUserAndToken.token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.admins).to.include(userAndToken.user.id);
            done();
          });
      });
    });

    context('without group admin permissions', () => {
      it('doesn\'t add an admin', (done) => {
        request(app)
          .post(`${groupUrl}/${group.name}/user/${userAndToken.user.id}/admin`)
          .set('Authorization', `Bearer ${userAndToken.token}`)
          .expect(httpStatus.UNAUTHORIZED)
          .then(() => done());
      });
    });

    context('without a nonexistent user', () => {
      it('doesn\'t add an admin', (done) => {
        request(app)
          .post(`${groupUrl}/${group.name}/user/${uuid.user}/admin`)
          .set('Authorization', `Bearer ${adminUserAndToken.token}`)
          .expect(httpStatus.BAD_REQUEST)
          .then(() => done());
      });
    });
  });

  describe('# POST /api/v1/group/:groupName/joinRequests', () => {
    let groupAdminUserAndToken;
    let adminUserAndToken;
    let userAndToken;
    let group;

    beforeEach((done) => {
      const groupAdminUserBuild = buildAndAuth('user', fixtures.user())
        .then(createdUserAndToken => (groupAdminUserAndToken = createdUserAndToken));
      const adminUserBuild = buildAndAuth('user', fixtures.user({ isSysAdmin: true }))
        .then(createdUserAndToken => (adminUserAndToken = createdUserAndToken));
      const userBuild = buildAndAuth('user', fixtures.user())
        .then(createdUserAndToken => (userAndToken = createdUserAndToken));

      Promise.all([groupAdminUserBuild, adminUserBuild, userBuild])
        .then(values => build('group', fixtures.group({
          joinRequests: [values[2].user.id],
          admins: [values[0].user.id]
        })))
        .then((g) => {
          group = g;
          done();
        });
    });

    context('with group admin permissions', () => {
      it('accepts a join request', (done) => {
        request(app)
          .put(`${groupUrl}/${group.name}/request`)
          .set('Authorization', `Bearer ${groupAdminUserAndToken.token}`)
          .send({
            userId: userAndToken.user.id,
            isAccepted: true
          })
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.joinRequests).to.be.empty;
            expect(res.body.users).to.include(userAndToken.user.id);
            done();
          });
      });
    });

    context('with admin permissions', () => {
      it('accepts a join request', (done) => {
        request(app)
          .put(`${groupUrl}/${group.name}/request`)
          .set('Authorization', `Bearer ${adminUserAndToken.token}`)
          .send({
            userId: userAndToken.user.id,
            isAccepted: true
          })
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.joinRequests).to.be.empty;
            expect(res.body.users).to.include(userAndToken.user.id);
            done();
          });
      });
    });

    context('without group admin permissions', () => {
      it('throws UNAUTHORIZED', (done) => {
        request(app)
          .put(`${groupUrl}/${group.name}/request`)
          .set('Authorization', `Bearer ${userAndToken.token}`)
          .send({
            userId: userAndToken.user.id,
            isAccepted: true
          })
          .expect(httpStatus.UNAUTHORIZED)
          .then(() => done());
      });
    });

    context('with a nonexistent user', () => {
      it('throws for nonexistent user', (done) => {
        request(app)
          .put(`${groupUrl}/${group.name}/user/${uuid.user}/admin`)
          .set('Authorization', `Bearer ${adminUserAndToken.token}`)
          .send({
            userId: userAndToken.user.id,
            isAccepted: true
          })
          .expect(httpStatus.NOT_FOUND)
          .then(() => done());
      });
    });
  });
});
