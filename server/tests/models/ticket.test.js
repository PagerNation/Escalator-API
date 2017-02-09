import _ from 'lodash';
import Ticket from '../../models/ticket';

describe('## Ticket Model', () => {
  context('# with new ticket', () => {
    const ticket = new Ticket({
      groupName: 'testGroupName',
      metadata: {
        message: 'Something bad!',
        metrics: {
          foo: 'bar',
          jiggawatts: 420
        }
      }
    });

    it('should successfully save', (done) => {
      ticket.save((err) => {
        expect(err).to.be.null;
        done();
      });
    });
  });

  context('# with no group name', () => {
    const ticket = new Ticket({
      metadata: {
        message: 'blah',
        metrics: {
          foo: 'bar',
          jiggawatts: 420
        }
      }
    });

    it('should be rejected', (done) => {
      ticket.save((error) => {
        expect(error.errors.groupName.message).to.be.equal('Path `groupName` is required.');
        done();
      });
    });
  });
});
