import alertService from '../../services/alert';
import { build, fixtures, uuid } from '../../utils/factories';

describe('## Alert Service', () => {
  describe('# generateUserPageRequests()', () => {
    let user;

    before((done) => {
      const userBuild = build('user', fixtures.user());
      const deviceBuild = build('device', fixtures.smsDevice());
      Promise.all([userBuild, deviceBuild])
        .then(results => results[0].addDevice(results[1], 0))
        .then((updatedUser) => {
          user = updatedUser;
          done();
        });
    });

    it('creates a valid user page request', (done) => {
      const ticketId = uuid.ticket;
      const delay = 1;
      const title = 'testing title';

      const pageRequests = alertService.generateUserPageRequests(ticketId, user, delay, title);
      expect(pageRequests).to.have.length(1);
      expect(pageRequests[0].ticketId).to.equal(ticketId);
      expect(pageRequests[0].userId).to.equal(user.id);
      expect(pageRequests[0].device.name).to.equal(user.devices[0].name);
      expect(pageRequests[0].delay).to.equal(delay * 60 * 1000);
      expect(pageRequests[0].title).to.equal(title);
      done();
    });
  });
});
