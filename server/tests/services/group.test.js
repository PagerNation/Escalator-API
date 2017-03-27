import httpStatus from 'http-status';
import scheduler from 'node-schedule';
import groupService from '../../services/group';
import Group from '../../models/group';
import { build, fixtures, uuid } from '../../utils/factories';
import userService from '../../services/user';
import { equalDates } from '../helpers/dateHelper';

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
              expect(equalDates(createdGroup.lastRotated, new Date())).to.equal(true);
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
        .then(() => {
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
      let userId = '123456789012345678901234';

      let group;

      beforeEach((done) => {
        build('user', fixtures.user())
          .then((u) => {
            userId = u.id;
            return build('group', fixtures.group({ users: [`${userId}`] }));
          })
          .then((g) => {
            group = g;
            userService.addGroupByUserId(userId, group.name)
              .then(() => done());
          });
      });

      context('when the user exists', () => {
        it('should remove a user from the group by id', (done) => {
          groupService.removeUser(group, userId)
            .then((savedGroup) => {
              expect(savedGroup).to.exist;
              expect(savedGroup.name).to.equal(group.name);
              expect(savedGroup.users).to.not.include(userId);
              done();
            });
        });

        it('should remove the group from the user', (done) => {
          groupService.removeUser(group, userId)
            .then(() => userService.getUser(userId))
            .then((user) => {
              expect(user).to.exist;
              expect(user.groups).to.not.include(group.name);
              done();
            });
        });
      });

      context('when the user does not exist', () => {
        userId = '098765432109876543210987';

        it('should fail silently if the user does not exist', (done) => {
          groupService.removeUser(group, userId)
            .then((tmpGroup) => {
              expect(tmpGroup).to.exist;
              expect(tmpGroup.users).to.not.include(userId);
              done();
            });
        });

        it('should throw an error if the user id is formatted incorrectly', (done) => {
          groupService.removeUser(group, 'tooshort')
            .catch((err) => {
              expect(err).to.exist;
              expect(err.name).to.equal('ValidationError');
              done();
            });
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
          pagingIntervalInMinutes: 1111,
          rotationIntervalInDays: 2222
        };

        it('should update a group\'s escalation policy', (done) => {
          groupService.updateEscalationPolicy(group.name, newEscalationPolicy)
            .then((savedGroup) => {
              expect(savedGroup).to.exist;
              expect(savedGroup.escalationPolicy.pagingIntervalInMinutes)
                .to.equal(newEscalationPolicy.pagingIntervalInMinutes);
              expect(savedGroup.escalationPolicy.rotationIntervalInDays)
                .to.equal(newEscalationPolicy.rotationIntervalInDays);
              done();
            });
        });
      });

      context('with incorrect body fields', () => {
        const newEscalationPolicy = {
          pagingIntervalInMinutesssss: 1111
        };

        it('should not update escalation policy with incorrect fields', (done) => {
          groupService.updateEscalationPolicy(group.name, newEscalationPolicy)
            .catch((err) => {
              expect(err).to.exist;
              expect(err.message).to.equal('"pagingIntervalInMinutesssss" is not allowed');
              done();
            });
        });
      });
    });
  });

  describe('# addAdmin()', () => {
    let group;
    let user;

    beforeEach((done) => {
      const groupBuild = build('group', fixtures.group());
      const userBuild = build('user', fixtures.user());
      Promise.all([groupBuild, userBuild])
        .then((values) => {
          group = values[0];
          user = values[1];
          done();
        });
    });

    it('adds a new admin', (done) => {
      groupService.addAdmin(group.name, user.id)
        .then((updatedGroup) => {
          expect(updatedGroup.admins).to.include(user.id);
          done();
        });
    });
  });

  describe('# scheduleEPRotation()', () => {
    let group;

    beforeEach((done) => {
      build('group', fixtures.group())
        .then((g) => {
          group = g;
          done();
        });
    });

    it('should schedule the next job', (done) => {
      groupService.scheduleEPRotation(group)
        .then((returnObj) => {
          const jobs = scheduler.scheduledJobs;
          const nextJob = jobs[Object.keys(jobs)[0]];
          expect(returnObj.nextRotateDate).to.exist;
          expect(equalDates(returnObj.nextRotateDate, nextJob.nextInvocation())).to.equal(true);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('# rotateEscalationPolicy()', () => {
    let group;
    const subscribers = ['123456789012345678901234', '121212121212121212121212', '098765432109876543210987'];
    const escalationPolicy = { subscribers };
    const lastRotated = new Date(2015, 11, 10, 0, 0, 0);

    beforeEach((done) => {
      build('group', fixtures.group({ escalationPolicy, lastRotated }))
        .then((g) => {
          group = g;
          done();
        });
    });

    it('moves the last user to the beginning of the list, updates lastRotated date', (done) => {
      const schedulerLength = Object.keys(scheduler.scheduledJobs).length;

      groupService.rotateEscalationPolicy(group)
        .then((updatedGroup) => {
          const ep = updatedGroup.escalationPolicy;
          expect(ep.subscribers.length).to.eq(subscribers.length);
          expect(ep.subscribers[0].toString()).to.eq(subscribers[1]);
          expect(ep.subscribers[1].toString()).to.eq(subscribers[2]);
          expect(ep.subscribers[2].toString()).to.eq(subscribers[0]);

          expect(equalDates(updatedGroup.lastRotated, new Date())).to.eq(true);

          expect(Object.keys(scheduler.scheduledJobs).length).to.eq(schedulerLength + 1);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('# makeJoinRequest()', () => {
    let group;
    let user;

    beforeEach((done) => {
      const groupBuild = build('group', fixtures.group());
      const userBuild = build('user', fixtures.user());
      Promise.all([groupBuild, userBuild])
        .then((values) => {
          group = values[0];
          user = values[1];
          done();
        });
    });

    it('makes a join request for a user to join a group', (done) => {
      groupService.makeJoinRequest(group.name, user.id)
        .then((updatedGroup) => {
          expect(updatedGroup.joinRequests).to.include(user.id);
          done();
        });
    });

    it('fails to create a join request for a user that doesn\'t exist', (done) => {
      groupService.makeJoinRequest(group.name, uuid.user)
        .catch((err) => {
          expect(err.message).to.equal('No such user exists!');
          done();
        });
    });
  });

  describe('# processJoinRequest()', () => {
    let group;
    let user;

    beforeEach((done) => {
      build('user', fixtures.user())
        .then((newUser) => {
          user = newUser;
          return build('group', fixtures.group({ joinRequests: [newUser.id] }));
        })
        .then((newGroup) => {
          group = newGroup;
          done();
        });
    });

    context('with a valid request', () => {
      it('accepts a group join request', (done) => {
        groupService.processJoinRequest(group, user.id, true)
          .then((updatedGroup) => {
            expect(updatedGroup.joinRequests).to.be.empty;
            expect(updatedGroup.users).to.include(user.id);
            done();
          });
      });

      it('denies a group join request', (done) => {
        groupService.processJoinRequest(group, user.id, false)
          .then((updatedGroup) => {
            expect(updatedGroup.joinRequests).to.be.empty;
            expect(updatedGroup.users).to.not.include(user.id);
            done();
          });
      });
    });

    context('with an invalid request', () => {
      it('throws an error for invalid request', (done) => {
        groupService.processJoinRequest(group, uuid.user, true)
          .catch((err) => {
            expect(err.message).to.equal('No request for user to join group');
            done();
          });
      });
    });
  });

  describe('# searchByName()', () => {
      beforeEach((done) => {
        build('group', fixtures.group({ name: 'test' }))
          .then(() => build('group', fixtures.group({ name: 'nothing' })))
          .then(() => done());
      });

      it('should find one group', (done) => {
        groupService.searchByName('tes')
          .then((groups) => {
            expect(groups).to.have.length(1);
            expect(groups[0].name).to.equal('test');
            done();
          });
      });

      it('should find two groups', (done) => {
        groupService.searchByName('t')
          .then((groups) => {
            expect(groups).to.have.length(2);
            done();
          });
      });

      it('should find zero groups', (done) => {
        groupService.searchByName('please do not exist')
          .then((groups) => {
            expect(groups).to.have.length(0);
            done();
          });
      });
    });
});
