import scheduler from 'node-schedule';
import groupService from '../../services/group';
import groupLoader from '../../utils/groupLoader';
import { build, fixtures } from '../../utils/factories';

describe('## Group Loader', () => {
  let group;
  let scheduledJobsCount;
  let deactivateUser;
  let reactivateUser;
  const deactivateDate = new Date();
  deactivateDate.setDate(deactivateDate.getDate() + 2);
  const reactivateDate = new Date();
  reactivateDate.setDate(reactivateDate.getDate() + 3);

  beforeEach((done) => {
    build('user', fixtures.user())
      .then((u1) => {
        deactivateUser = u1;
        scheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
        return build('user', fixtures.user());
      })
      .then((u2) => {
        reactivateUser = u2;
        const subscribers = [
          { userId: deactivateUser.id, deactivateDate },
          { userId: reactivateUser.id, reactivateDate, active: false }
        ];
        const escalationPolicy = fixtures.escalationPolicy({ subscribers });
        return build('group', fixtures.group({ escalationPolicy }));
      })
      .then(() => build('group', fixtures.group()))
      .then(() => done());
  });

  describe('# bulkScheduleEPRotation()', () => {
    let groupsCount;

    beforeEach((done) => {
      groupService.getGroups({})
        .then((groups) => {
          groupsCount = groups.length;
          done();
        });
    });

    it('should schedule a rotation for all groups', (done) => {
      groupLoader.bulkScheduleEPRotation()
        .then((result) => {
          expect(result.length).to.eq(groupsCount);
          const newScheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
          expect(newScheduledJobsCount).to.eq(scheduledJobsCount + groupsCount);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('# rescheduleDeactivation()', () => {
    it('should schedule a deactivation for all groups in the list', (done) => {
      groupLoader.rescheduleDeactivation()
        .then((scheduledDeactivations) => {
          expect(scheduledDeactivations.length).to.eq(1);
          const newScheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
          expect(newScheduledJobsCount).to.eq(scheduledJobsCount + 1);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('# rescheduleReactivation()', () => {
    it('should schedule a reactivation for all groups in the list', (done) => {
      groupLoader.rescheduleReactivation()
        .then((scheduledReactivations) => {
          expect(scheduledReactivations.length).to.eq(1);
          const newScheduledJobsCount = Object.keys(scheduler.scheduledJobs).length;
          expect(newScheduledJobsCount).to.eq(scheduledJobsCount + 1);
          done();
        })
        .catch(err => done(err));
    });
  });
});
