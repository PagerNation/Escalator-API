import _ from 'lodash';
import { fixtures } from '../../utils/factories';
import Ticket from '../../models/ticket';

describe('## Ticket Model', () => {
  context('# with new ticket', () => {
    const ticket = fixtures.ticket();

    it('should successfully save', (done) => {
      Ticket.create(ticket, (err) => {
        expect(err).to.be.null;
        done();
      });
    });
  });

  context('# with no group name', () => {
    const ticket = fixtures.ticket();
    delete ticket.groupName;

    it('should be rejected', (done) => {
      Ticket.create(ticket, (err) => {
        expect(err.errors.groupName.message).to.be.equal('Path `groupName` is required.');
        done();
      });
    });
  });
});
