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
            }).catch(err => done(err)); });
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
            .then(() => groupService.getGroup(groupObject.name))
            .catch((err, group) => {
              expect(err).to.exist;
              expect(err.status).to.equal(httpStatus.NOT_FOUND);
              done();
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
          .then(() => build('user', userObject))
          .then((u) => {
            user = u;
            done();
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
            const subscribers = [
              { user: userId }
            ];

            return build('escalationPolicy', fixtures.escalationPolicy({ subscribers }));
          })
          .then(escalationPolicy =>
            build('group', fixtures.group({ users: [userId], escalationPolicy })))
          .then((g) => {
            group = g;
            return userService.addGroupByUserId(userId, group.name);
          })
          .then(() => done())
          .catch(err => done(err));
      });

      context('when the user is an admin and in the escalation policy', () => {
        beforeEach((done) => {
          groupService.addAdmin(group.name, userId)
            .then((g) => {
              group = g;
              done();
            });
        });

        it('should remove the user from the EP and admin lists', (done) => {
          groupService.removeUser(group, userId)
            .then((savedGroup) => {
              expect(savedGroup.name).to.equal(group.name);
              expect(savedGroup.users).to.not.include(userId);
              expect(savedGroup.admins).to.not.include(userId);
              expect(savedGroup.escalationPolicy.subscribers).to.be.empty;
              done();
            });
        });
      });

      context('when the user exists', () => {
        it('should remove a user from the group by id', (done) => {
          groupService.removeUser(group, userId)
            .then((savedGroup) => {
              expect(savedGroup).to.exist;
              expect(savedGroup.name).to.equal(group.name);
              expect(savedGroup.users).to.not.include(userId);
              expect(savedGroup.escalationPolicy.subscribers).to.be.empty;
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
      const subscriber = { userId: '123456789098765432123456' };

      let group;

      beforeEach((done) => {
        build('escalationPolicy', fixtures.escalationPolicy({ subscribers: [subscriber] }))
          .then(escalationPolicy => build('group', fixtures.group({ escalationPolicy })))
          .then((newGroup) => {
            group = newGroup;
            done();
          });
      });

      context('with correct body fields', () => {
        const newEscalationPolicy = {
          pagingIntervalInMinutes: 1111,
          rotationIntervalInDays: 2222,
          subscribers: []
        };

        it('should update a group\'s escalation policy', (done) => {
          groupService.updateEscalationPolicy(group.name, newEscalationPolicy)
            .then((savedGroup) => {
              expect(savedGroup).to.exist;
              expect(savedGroup.escalationPolicy.pagingIntervalInMinutes)
                .to.equal(newEscalationPolicy.pagingIntervalInMinutes);
              expect(savedGroup.escalationPolicy.rotationIntervalInDays)
                .to.equal(newEscalationPolicy.rotationIntervalInDays);
              expect(savedGroup.escalationPolicy.subscribers)
                .to.be.empty;
              done();
            })
            .catch(err => done(err));
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
        })
        .catch(err => done(err));
    });

    it('adds a new admin', (done) => {
      groupService.addAdmin(group.name, user.id)
        .then((updatedGroup) => {
          expect(updatedGroup.users).to.include(user.id);
          expect(updatedGroup.admins).to.include(user.id);
          done();
        });
    });
  });

  describe('# removeAdmin()', () => {
    let group;
    let user;
    let user2;

    beforeEach((done) => {
      Promise.all([build('user', fixtures.user()), build('user', fixtures.user())])
        .then((results) => {
          user = results[0];
          user2 = results[1];
          return build('group', fixtures.group({ admins: [user.id, user2.id] }));
        })
        .then((groupB) => {
          group = groupB;
          done();
        });
    });

    it('removes an admin', (done) => {
      groupService.removeAdmin(group.name, user.id)
        .then((updatedGroup) => {
          expect(updatedGroup.admins).to.include(user2.id);
          done();
        });
    });

    it('does not remove last admin', (done) => {
      groupService.removeAdmin(group.name, user.id)
        .then(updatedGroup => groupService.removeAdmin(group.name, user2.id))
        .catch((err) => {
          expect(err.errors.admins.message).to.equal('Group must have at least one admin');
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
    const subscribers = [
      { user: '123456789012345678901234' },
      { user: '121212121212121212121212' },
      { user: '098765432109876543210987' }
    ];
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
          expect(ep.subscribers[0].user.toString()).to.eq(subscribers[1].user);
          expect(ep.subscribers[1].user.toString()).to.eq(subscribers[2].user);
          expect(ep.subscribers[2].user.toString()).to.eq(subscribers[0].user);

          expect(equalDates(updatedGroup.lastRotated, new Date())).to.eq(true);

          expect(Object.keys(scheduler.scheduledJobs).length).to.eq(schedulerLength + 1);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('# makeJoinRequest()', () => {
    let group;
    let group2;
    let user;

    beforeEach((done) => {
      const groupBuild = build('group', fixtures.group());
      const userBuild = build('user', fixtures.user());
      Promise.all([groupBuild, userBuild])
        .then((values) => {
          group = values[0];
          user = values[1];
        })
        .then(() => build('group', fixtures.group({ users: [user.id] })))
        .then((builtGroup) => {
          group2 = builtGroup;
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

    it('can\'t create multiple requests for the same group', (done) => {
      groupService.makeJoinRequest(group.name, user.id)
        .then(() => groupService.makeJoinRequest(group.name, user.id))
        .catch((err) => {
          expect(err.message).to.equal('User has a pending request for this group');
          done();
        });
    });

    it('can\'t create a join requests for a group you are in', (done) => {
      groupService.makeJoinRequest(group2.name, user.id)
        .catch((err) => {
          expect(err.message).to.equal('User is already in this group');
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

  describe('# scheduleDeactivateUser', () => {
    let group;
    let user1;
    let user2;
    let scheduledJobsCount;

    beforeEach((done) => {
      const buildUser1Promise = build('user', fixtures.user());
      const buildUser2Promise = build('user', fixtures.user());

      Promise.all([buildUser1Promise, buildUser2Promise])
        .then((results) => {
          user1 = results[0];
          user2 = results[1];
          const subscribers = [
            { user: user1.id },
            { user: user2.id }
          ];
          const escalationPolicy = fixtures.escalationPolicy({ subscribers });
          return build('group', fixtures.group({ escalationPolicy }));
        })
        .then((newGroup) => {
          group = newGroup;
          scheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
          done();
        });
    });

    context('with immediate deactivation', () => {
      const deactivateDate = new Date();
      const reactivateDate = new Date(deactivateDate);
      reactivateDate.setDate(reactivateDate.getDate() + 2);

      it('should deactivate a user immediately', (done) => {
        groupService.scheduleDeactivateUser(group, user1.id, deactivateDate, reactivateDate)
          .then((returnObj) => {
            const subscribers = returnObj.group.escalationPolicy.subscribers;
            expect(subscribers[0].user.toString()).to.eq(user1.id.toString());
            expect(subscribers[0].active).to.eq(false);

            expect(Object.keys(scheduler.scheduledJobs).length).to.eq(scheduledJobsCount + 1);
            done();
          })
          .catch(err => done(err));
      });
    });

    context('with scheduled deactivation', () => {
      const deactivateDate = new Date();
      deactivateDate.setDate(deactivateDate.getDate() + 2);
      const reactivateDate = new Date(deactivateDate);
      reactivateDate.setDate(reactivateDate.getDate() + 2);

      it('should scheduled a job to deactivate the user', (done) => {
        groupService.scheduleDeactivateUser(group, user1.id, deactivateDate, reactivateDate)
          .then((returnObj) => {
            expect(equalDates(returnObj.deactivateDate, deactivateDate)).to.eq(true);
            expect(returnObj.group.name).to.eq(group.name);

            const subscribers = returnObj.group.escalationPolicy.subscribers;
            expect(subscribers[0].user.toString()).to.eq(user1.id.toString());
            expect(subscribers[0].active).to.eq(true);

            expect(Object.keys(scheduler.scheduledJobs).length).to.eq(scheduledJobsCount + 1);
            done();
          })
          .catch(err => done(err));
      });
    });
  });

  describe('# scheduleReactivateUser', () => {
    let group;
    let user1;
    let user2;
    let scheduledJobsCount;

    beforeEach((done) => {
      const buildUser1Promise = build('user', fixtures.user());
      const buildUser2Promise = build('user', fixtures.user());

      Promise.all([buildUser1Promise, buildUser2Promise])
        .then((results) => {
          user1 = results[0];
          user2 = results[1];
          done();
        });
    });

    context('with immediate reactivation', () => {
      beforeEach((done) => {
        const subscribers = [
          { user: user1.id, active: false, deactivateDate: null, reactivateDate: new Date() },
          { user: user2.id }
        ];

        const escalationPolicy = fixtures.escalationPolicy({ subscribers });
        build('group', fixtures.group({ escalationPolicy }))
          .then((newGroup) => {
            group = newGroup;
            scheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
            done();
          });
      });

      it('should reactivate that user immediately', (done) => {
        groupService.scheduleReactivateUser(group, user1.id)
          .then((returnObj) => {
            const subscribers = returnObj.group.escalationPolicy.subscribers;
            expect(subscribers[0].user.toString()).to.eq(user1.id.toString());
            expect(subscribers[0].active).to.eq(true);

            expect(Object.keys(scheduler.scheduledJobs).length).to.eq(scheduledJobsCount);
            done();
          })
          .catch(err => done(err));
      });
    });

    context('with scheduled reactivation', () => {
      beforeEach((done) => {
        const reactivateDate = new Date();
        reactivateDate.setDate(reactivateDate.getDate() + 2);

        const subscribers = [
          { user: user1.id, active: false, deactivateDate: null, reactivateDate },
          { user: user2.id }
        ];

        const escalationPolicy = fixtures.escalationPolicy({ subscribers });
        build('group', fixtures.group({ escalationPolicy }))
          .then((newGroup) => {
            group = newGroup;
            scheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
            done();
          });
      });

      it('should schedule the reactivation', (done) => {
        groupService.scheduleReactivateUser(group, user1.id)
          .then((returnObj) => {
            const subscribers = returnObj.group.escalationPolicy.subscribers;
            expect(subscribers[0].user.toString()).to.eq(user1.id.toString());
            expect(subscribers[0].active).to.eq(false);

            expect(Object.keys(scheduler.scheduledJobs).length).to.eq(scheduledJobsCount + 1);
            done();
          })
          .catch(err => done(err));
      });
    });
  });

  describe('# deactivateUser', () => {
    let group;
    let user1;
    let user2;
    const deactivateDate = new Date();
    const reactivateDate = new Date(deactivateDate);
    reactivateDate.setDate(reactivateDate.getDate() + 2);

    beforeEach((done) => {
      const buildUser1Promise = build('user', fixtures.user());
      const buildUser2Promise = build('user', fixtures.user());

      Promise.all([buildUser1Promise, buildUser2Promise])
        .then((results) => {
          user1 = results[0];
          user2 = results[1];
          const subscribers = [
            { user: user1.id, deactivateDate, reactivateDate },
            { user: user2.id }
          ];
          const escalationPolicy = fixtures.escalationPolicy({ subscribers });
          return build('group', fixtures.group({ escalationPolicy }));
        })
        .then((newGroup) => {
          group = newGroup;
          done();
        });
    });

    it('should deactivate the user', (done) => {
      groupService.deactivateUser(group, user1.id, deactivateDate, reactivateDate)
        .then((resultingGroup) => {
          const subscribers = resultingGroup.escalationPolicy.subscribers;
          expect(subscribers[0].user.toString()).to.eq(user1.id.toString());
          expect(subscribers[0].deactivateDate).to.eq(null);
          expect(subscribers[0].active).to.eq(false);

          expect(subscribers[1].user.toString()).to.eq(user2.id.toString());
          expect(subscribers[1].deactivateDate).to.eq(null);
          expect(subscribers[1].active).to.eq(true);

          done();
        })
        .catch(err => done(err));
    });
  });

  describe('# reactivateUser', () => {
    let group;
    let user1;
    let user2;
    const reactivateDate = new Date();

    beforeEach((done) => {
      const buildUser1Promise = build('user', fixtures.user());
      const buildUser2Promise = build('user', fixtures.user());

      Promise.all([buildUser1Promise, buildUser2Promise])
          .then((results) => {
            user1 = results[0];
            user2 = results[1];
            const subscribers = [
              { user: user1.id, active: false, reactivateDate },
              { user: user2.id }
            ];
            const escalationPolicy = fixtures.escalationPolicy({ subscribers });
            return build('group', fixtures.group({ escalationPolicy }));
          })
          .then((newGroup) => {
            group = newGroup;
            done();
          });
    });

    it('should reactivate the user', (done) => {
      groupService.reactivateUser(group, user1.id)
        .then((resultingGroup) => {
          const subscribers = resultingGroup.escalationPolicy.subscribers;

          expect(subscribers[0].user.toString()).to.eq(user1.id.toString());
          expect(subscribers[0].reactivateDate).to.eq(null);
          expect(subscribers[0].active).to.eq(true);

          expect(subscribers[1].user.toString()).to.eq(user2.id.toString());
          expect(subscribers[1].reactivateDate).to.eq(null);
          expect(subscribers[1].active).to.eq(true);
          done();
        })
        .catch(err => done(err));
    });
  });
});
