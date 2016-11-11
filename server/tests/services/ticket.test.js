import httpStatus from 'http-status';
import ticketService from '../../services/ticket';
import { build, fixtures } from '../factories';

describe('# Ticket Service', () => {
  const ticketObject = fixtures.ticket();

  // Create
  describe('createTicket()', () => {
    context('with valid ticket details', () => {
      it('creates a new ticket', (done) => {
        ticketService.createTicket(ticketObject)
          .then((createdTicket) => {
            expect(createdTicket).to.exist;
            expect(createdTicket.groupId.toString()).to.equal(ticketObject.groupId);
            expect(createdTicket.metadata.message).to.equal(ticketObject.metadata.message);
            expect(createdTicket.metadata.metrics.foo).to.equal(ticketObject.metadata.metrics.foo);
            expect(createdTicket.metadata.metrics.jiggawatts).to
              .equal(ticketObject.metadata.metrics.jiggawatts);
            done();
          })
          .catch(err => done(err));
      });
    });

    context('with missing ticket details', () => {
      const missingGroupIdTicket = {
        metadata: {
          message: 'Something bad!',
          metrics: {
            foo: 'bar',
            jiggawatts: 420
          }
        }
      };

      const missingMetadataTicket = {
        groupId: '551137c2f9e1fac808a5f572'
      };

      it('should fail validation due to the ticket missing a groupId', (done) => {
        ticketService.createTicket(missingGroupIdTicket)
          .catch((err) => {
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"groupId" is required');
            done();
          });
      });

      it('should fail validation due to the ticket missing metadata', (done) => {
        ticketService.createTicket(missingMetadataTicket)
          .catch((err) => {
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"metadata" is required');
            done();
          });
      });
    });
  });

  // Get
  describe('getTicket()', () => {
    let savedTicketId;

    before((done) => {
      ticketService.createTicket(ticketObject)
        .then((createdTicket) => {
          savedTicketId = createdTicket._id;
          done();
        });
    });

    it('gets an existing ticket', (done) => {
      ticketService.getById(savedTicketId.toString()).then((ticket) => {
        expect(ticket).to.exist;
        expect(ticket.groupId.toString()).to.equal(ticketObject.groupId);
        expect(ticket.metadata.message).to.equal(ticketObject.metadata.message);
        expect(ticket.metadata.metrics.foo).to.equal(ticketObject.metadata.metrics.foo);
        expect(ticket.metadata.metrics.jiggawatts)
          .to.equal(ticketObject.metadata.metrics.jiggawatts);
        done();
      });
    });

    it('can\'t find ticket for a given ticketId', (done) => {
      ticketService.getById('000000000000000000000000')
        .catch((err, user) => {
          expect(err).to.exist;
          expect(err.status).to.equal(httpStatus.NOT_FOUND);
          done();
        });
    });
  });

  // Update
  describe('updateTicket()', () => {
    let savedTicketId;

    const updateDetails = {
      groupId: '551137c2f9e1fac808a5f573',
      metadata: {
        foo: 'baz'
      }
    };

    before((done) => {
      ticketService.createTicket(ticketObject)
        .then((createdTicket) => {
          savedTicketId = createdTicket._id;
          done();
        });
    });

    it('updates an existing ticket', (done) => {
      ticketService.updateTicket(savedTicketId, updateDetails)
        .then((ticket) => {
          expect(ticket).to.exist;
          expect(ticket._id.toString()).to.equal(savedTicketId.toString());
          expect(ticket.groupId.toString()).to.equal('551137c2f9e1fac808a5f573');
          expect(ticket.metadata.foo).to.equal('baz');
          expect(ticket.metadata.jiggawatts).to.not.exist;
          done();
        });
    });

    it('fails to update a ticket with invalid fields', (done) => {
      ticketService.updateTicket(savedTicketId, { metadata: 0 })
        .catch((err, ticket) => {
          expect(err).to.exist;
          expect(err.name).to.equal('ValidationError');
          expect(err.details[0].message).to.equal('"groupId" is required');
          done();
        });
    });
  });

  // Delete
  describe('deleteTicket()', () => {
    let savedTicketId;

    before((done) => {
      ticketService.createTicket(ticketObject)
        .then((createdTicket) => {
          savedTicketId = createdTicket._id.toString();
          done();
        });
    });

    it('should delete a ticket', (done) => {
      ticketService.deleteById(savedTicketId)
        .then(() => {
          ticketService.getById(savedTicketId)
            .catch((err, user) => {
              expect(err).to.exist;
              expect(err.status).to.equal(httpStatus.NOT_FOUND);
              done();
            });
        });
    });
  });
});
