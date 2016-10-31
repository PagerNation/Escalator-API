import _ from 'lodash';
import Ticket from '../../models/ticket';

describe('## Ticket Model', () => {
  context('with new ticket', () => {
    const ticket = new Ticket({
      groupId: '551137c2f9e1fac808a5f572',
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
        // saved!
        done();
      });
    });
  });

  context('with invalid objectId', () => {
    const ticket = new Ticket({
      groupId: 'invalid_objectId',
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
        expect(error.errors.groupId.message).to.be.equal('Cast to ObjectID failed for value "invalid_objectId" at path "groupId"');
        done();
      });
    });
  });
});
