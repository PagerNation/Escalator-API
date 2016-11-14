import httpStatus from 'http-status';
import groupService from '../../services/group';
import Group from '../../models/group';
import { build, fixtures } from '../factories';

describe('# Group Service', () => {
  const groupObject = fixtures.group();

  context('with no groups in the database beforehand', () => {
    describe('createGroup()', () => {
      context('with valid group details', () => {
        it('creates a new group', (done) => {
          groupService.createGroup(groupObject)
            .then((createdGroup) => {
              expect(createdGroup).to.exist;
              expect(createdGroup.name).to.equal(groupObject.name);
              expect(createdGroup.users[0].toString()).to.equal(groupObject.users[0]);
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

    describe('getGroup()', () => {
      context('with a valid group name', () => {
        it('returns a group object', (done) => {
          groupService.getGroup(groupObject.name)
            .then((group) => {
              expect(group).to.exist;
              expect(group.name).to.equal(groupObject.name);
              expect(group.users[0].toString()).to.equal(groupObject.users[0]);
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

    describe('updateGroup()', () => {
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

    describe('deleteGroup()', () => {
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

    describe('# addUser', () => {
      const userId = '098765432109876543210987';

      let group;

      beforeEach((done) => {
        groupService.getGroup(groupObject.name)
          .then((receivedGroup) => {
            group = receivedGroup;
            expect(receivedGroup).to.exist;
            done();
          });
      });

      it('should add a user to the group by id', (done) => {
        groupService.addUser(group, userId)
          .then((savedGroup) => {
            expect(savedGroup).to.exist;
            expect(savedGroup.name).to.equal(group.name);
            expect(savedGroup.users).to.include(userId);
            done();
          });
      });
    });

    describe('# removeUser', () => {
      let group;
      let userId;

      beforeEach((done) => {
        groupService.getGroup(groupObject.name)
          .then((receivedGroup) => {
            group = receivedGroup;
            userId = groupObject.users[0];
            expect(receivedGroup).to.exist;
            done();
          });
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
  });
});
