import { seedAll, seedUsers, seedGroups } from '../../utils/seed';
import User from '../../models/user';
import Group from '../../models/group';
import Ticket from '../../models/ticket';

describe('## Seed', () => {
  it('adds 2 users to the database', (done) => {
    seedUsers(2)
      .then(() => {
        User.count({}, (err, count) => {
          expect(count).to.equal(2);
          done();
        });
      });
  });

  it('adds 2 groups to the database', (done) => {
    seedGroups(2)
      .then(() => Group.count({}))
      .then((groupCount) => {
        expect(groupCount).to.equal(2);
        done();
      });
  });

  it('adds users, groups, and tickets to the database', (done) => {
    seedAll(2)
      .then(() => User.find({}))
      .then((users) => {
        expect(users.length).to.equal(6);
        const firstUser = users[0];
        expect(firstUser.devices.length).to.equal(2);
        expect(firstUser.groups.length).to.equal(1);
        expect(firstUser.escalationPolicy.subscribers.length).to.equal(2);
      })
      .then(() => Group.find({}).exec())
      .then((groups) => {
        expect(groups.length).to.equal(2);
        expect(groups[0].users.length).to.equal(3);
      })
      .then(() => Ticket.count({}))
      .then((tCount) => {
        expect(tCount).to.equal(2);
        done();
      });
  });
});
