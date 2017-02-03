import httpStatus from 'http-status';
import groupService from '../../services/group';
import Group from '../../models/group';
import { build, fixtures } from '../../utils/factories';

describe('## Group Service', () => {
  const groupObject = fixtures.group();

  context('with no groups in the database beforehand', () => {
    describe('# createGroup()', () => {
      context('with valid group details', () => {
        it('creates a new group', (done) => {
          groupService.createGroup(groupObject)
            .then((createdGroup) => {
              expect(createdGroup).to.exist;
              expect(createdGroup.name).to.equal(groupObject.name);
              done();
            })
            .catch(err => done(err));
        });
      });

      context('with missing user details', () => {
        const groupMissingName = {
          users: ['123456789012345678901234']
        };

        it('should fail validation when missing a name', (done) => {
          groupService.createGroup(groupMissingName)
            .catch((err) => {
              expect(err.name).to.equal('ValidationError');
              expect(err.details[0].message).to.equal('"name" is required');
              done();
            });
        });
      });
    });
  });

  context('with a group in the database beforehand', () => {
    beforeEach((done) => {
      groupService.createGroup(groupObject)
        .then((createdGroup) => {
          done();
        });
    });

    describe('# getGroup()', () => {
      context('with a valid group name', () => {
        it('returns a group object', (done) => {
          groupService.getGroup(groupObject.name)
            .then((group) => {
              expect(group).to.exist;
              expect(group.name).to.equal(groupObject.name);
              done();
            });
        });
      });

      context('with an invalid group name', () => {
        it('throws an error', (done) => {
          groupService.getGroup('This group does not exist')
            .catch((err) => {
              expect(err).to.exist;
              expect(err.message).to.equal('No such group exists');
              done();
            });
        });
      });
    });

    describe('# updateGroup()', () => {
      context('with valid update details', () => {
        const updateDetails = {
          name: 'Superman'
        };

        it('updates an existing group', (done) => {
          groupService.updateGroup(groupObject.name, updateDetails)
            .then((group) => {
              expect(group).to.exist;
              expect(group.name).to.equal(updateDetails.name);
              done();
            });
        });
      });

      context('with invalid update details', () => {
        const updateDetails = {
          notARealKey: 0
        };

        it('throws an error', (done) => {
          groupService.updateGroup(groupObject.name, updateDetails)
            .catch((err, group) => {
              expect(err).to.exist;
              expect(err.name).to.equal('ValidationError');
              expect(err.details[0].message).to.equal('"notARealKey" is not allowed');
              done();
            });
        });
      });
    });

    describe('# deleteGroup()', () => {
      context('with a group that exists', () => {
        it('deletes the group', (done) => {
          groupService.deleteGroup(groupObject.name)
            .then(() => {
              groupService.getGroup(groupObject.name)
                .catch((err, group) => {
                  expect(err).to.exist;
                  expect(err.status).to.equal(httpStatus.NOT_FOUND);
                  done();
                });
            });
        });
      });

      context('with a group that does not exist', () => {
        it('should fail to delete it', (done) => {
          groupService.deleteGroup('DoesNotExist')
            .catch((err, group) => {
              expect(err).to.exist;
              expect(err.status).to.equal(httpStatus.NOT_FOUND);
              done();
            });
        });
      });
    });

    describe('# addUser()', () => {
      const userObject = fixtures.user();

      let group;
      let user;

      beforeEach((done) => {
        groupService.getGroup(groupObject.name)
          .then((receivedGroup) => {
            group = receivedGroup;
            expect(receivedGroup).to.exist;
          })
          .then(() => {
            build('user', userObject)
              .then((u) => {
                user = u;
                done();
              });
          });
      });

      it('should add a two way relationship between user and group', (done) => {
        groupService.addUser(group, user.id)
          .then((savedGroup) => {
            expect(savedGroup).to.exist;
            expect(savedGroup.name).to.equal(group.name);
            expect(savedGroup.users.length).to.equal(1);
            expect(savedGroup.users).to.include(user.id);
            done();
          });
      });
    });

    describe('# removeUser()', () => {
      const userId = '123456789098765432123456';

      let group;

      beforeEach((done) => {
        build('group', fixtures.group({ users: [`${userId}`] }))
          .then((newGroup) => {
            group = newGroup;
            expect(newGroup).to.exist;
            done();
          })
          ;
      });


      it('should remove a user to the group by id', (done) => {
        groupService.removeUser(group, userId)
          .then((savedGroup) => {
            expect(savedGroup).to.exist;
            expect(savedGroup.name).to.equal(group.name);
            expect(savedGroup.users).to.not.include(userId);
            done();
          });
      });

      it('should throw an error if the user id is invalid', (done) => {
        groupService.removeUser(group, 'invalid')
          .catch((err) => {
            expect(err).to.exist;
            expect(err.name).to.equal('ValidationError');
            done();
          });
      });
    });

    describe('# updateEscalationPolicy()', () => {
      const userId = '123456789098765432123456';

      let group;

      beforeEach((done) => {
        build('escalationPolicy', fixtures.escalationPolicy({ subscribers: [userId] }))
          .then(escalationPolicy => build('group', fixtures.group({ escalationPolicy })))
          .then((newGroup) => {
            group = newGroup;
            done();
          });
      });

      context('with correct body fields', () => {
        const newEscalationPolicy = {
          pagingInterval: 1111,
          rotationInterval: 2222
        };

        it('should update a group\'s escalation policy', (done) => {
          groupService.updateEscalationPolicy(group.name, newEscalationPolicy)
            .then((savedGroup) => {
              expect(savedGroup).to.exist;
              expect(savedGroup.escalationPolicy.pagingInterval)
                .to.equal(newEscalationPolicy.pagingInterval);
              expect(savedGroup.escalationPolicy.rotationInterval)
                .to.equal(newEscalationPolicy.rotationInterval);
              done();
            });
        });
      });

      context('with incorrect body fields', () => {
        const newEscalationPolicy = {
          pagingIntervalssss: 1111
        };

        it('should not update escalation policy with incorrect fields', (done) => {
          groupService.updateEscalationPolicy(group.name, newEscalationPolicy)
            .catch((err) => {
              expect(err).to.exist;
              expect(err.message).to.equal('"pagingIntervalssss" is not allowed');
              done();
            });
        });
      });
    });
  });
});
