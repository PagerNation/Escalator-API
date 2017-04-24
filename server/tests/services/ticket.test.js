import httpStatus from 'http-status';
import _ from 'lodash';
import ticketService from '../../services/ticket';
import Ticket, { actionTypes } from '../../models/ticket';
import { build, fixtures, uuid } from '../../utils/factories';

describe('## Ticket Service', () => {
  const ticketObject = fixtures.ticket();
  const userId = '123456789098765432123456';

  describe('# createTicket()', () => {
    context('with valid ticket details', () => {
      it('creates a new ticket', (done) => {
        ticketService.createTicket(ticketObject)
          .then((createdTicket) => {
            expect(createdTicket).to.exist;
            expect(createdTicket.groupName).to.equal(ticketObject.groupName);
            expect(createdTicket.metadata.title).to.equal(ticketObject.metadata.title);
            expect(createdTicket.metadata.description).to.equal(ticketObject.metadata.description);
            done();
          })
          .catch(err => done(err));
      });
    });
  });

  describe('# getTicket()', () => {
    let savedTicketId;

    before((done) => {
      ticketService.createTicket(ticketObject)
        .then((createdTicket) => {
          savedTicketId = createdTicket.id;
          done();
        });
    });

    it('gets an existing ticket', (done) => {
      ticketService.getById(savedTicketId.toString()).then((ticket) => {
        expect(ticket).to.exist;
        expect(ticket.groupName).to.equal(ticketObject.groupName);
        expect(ticket.metadata.message).to.equal(ticketObject.metadata.message);
        expect(ticket.metadata.title).to.equal(ticketObject.metadata.title);
        expect(ticket.metadata.description).to.equal(ticketObject.metadata.description);
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

  describe('# updateTicket()', () => {
    let savedTicket;

    const updateDetails = {
      groupName: 'updateTestGroupName',
      metadata: {
        title: 'baz'
      }
    };

    before((done) => {
      ticketService.createTicket(ticketObject)
        .then((createdTicket) => {
          savedTicket = createdTicket;
          done();
        });
    });

    it('updates an existing ticket', (done) => {
      ticketService.updateTicket(savedTicket.id, updateDetails)
        .then((ticket) => {
          expect(ticket).to.exist;
          expect(ticket.id).to.equal(savedTicket.id);
          expect(ticket.groupName).to.equal(updateDetails.groupName);
          expect(ticket.metadata.title).to.equal(updateDetails.metadata.title);
          expect(ticket.metadata.description).to.not.exist;
          done();
        });
    });
  });

  describe('# deleteTicket()', () => {
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
        .then(() => ticketService.getById(savedTicketId))
        .catch((err, user) => {
          expect(err).to.exist;
          expect(err.status).to.equal(httpStatus.NOT_FOUND);
          done();
        });
    });
  });

  describe('# getTicketsByDate()', () => {
    beforeEach((done) => {
      const promiseChain = [];
      for (let i = 0; i < 3; i++) {
        const ticketPromise = build('ticket', fixtures.ticket({ createdAt: i }));
        promiseChain.push(ticketPromise);
      }

      promiseChain.push(build('ticket', fixtures.ticket({ isOpen: false, groupName: 't', createdAt: 3 })));

      Promise.all(promiseChain)
        .then(() => done());
    });

    context('with valid filters', () => {
      it('gets all tickets', (done) => {
        ticketService.getTicketsByDate()
          .then((tickets) => {
            expect(tickets).to.have.lengthOf(4);
            done();
          });
      });

      it('gets all tickets between two times', (done) => {
        const filters = {
          from: 2,
          to: 3
        };

        ticketService.getTicketsByDate(filters)
          .then((tickets) => {
            expect(tickets).to.have.lengthOf(2);
            done();
          });
      });

      it('gets all open tickets', (done) => {
        const filters = {
          isOpen: 1
        };

        ticketService.getTicketsByDate(filters)
          .then((tickets) => {
            expect(tickets).to.have.lengthOf(3);
            done();
          });
      });

      it('gets all closed tickets', (done) => {
        const filters = {
          isOpen: 0
        };

        ticketService.getTicketsByDate(filters)
          .then((tickets) => {
            expect(tickets).to.have.lengthOf(1);
            done();
          });
      });

      it('gets all tickets for a given group tickets', (done) => {
        const filters = {
          groupName: 't'
        };

        ticketService.getTicketsByDate(filters)
          .then((tickets) => {
            expect(tickets).to.have.lengthOf(1);
            done();
          });
      });
    });
  });

  function createTicketWithActions() {
    let ticket;
    return build('ticket', fixtures.ticket())
      .then((sTicket) => {
        ticket = sTicket;

        return ticketService.addAction(ticket._id.toString(), actionTypes.CREATED, uuid.user)
          .then(() =>
            ticketService.addAction(ticket._id.toString(), actionTypes.CREATED, uuid.user))
          .then(() =>
            ticketService.addAction(ticket._id.toString(), actionTypes.PAGE_SENT, uuid.user));
      })
      .then(() => ticket);
  }

  describe('# getMostRecentTickets()', () => {
    let ticket1;
    let ticket2;

    beforeEach((done) => {
      createTicketWithActions()
        .then((ticket) => {
          ticket1 = ticket;
          return createTicketWithActions();
        })
        .then((ticket) => {
          ticket2 = ticket;
          done();
        });
    });

    it('only gets the most recent actions', (done) => {
      ticketService.getMostRecentTickets([ticket1.groupName, ticket2.groupName])
        .then((tickets) => {
          const groupOneTicket = _.find(tickets, { _id: ticket1.groupName });
          const groupTwoTicket = _.find(tickets, { _id: ticket2.groupName });

          expect(tickets).to.have.length(2);
          expect(groupOneTicket).to.exist;
          expect(groupOneTicket.actionTaken).to.equal(actionTypes.PAGE_SENT);
          expect(groupTwoTicket).to.exist;
          expect(groupTwoTicket.actionTaken).to.equal(actionTypes.PAGE_SENT);
          done()
        })
        .catch(e => done(e));
    });

    it('returns an empty list when a group has no tickets', (done) => {
      ticketService.getMostRecentTickets(['testing'])
        .then((tickets) => {
          const groupTicket = _.find(tickets, { _id: 'testing' });

          expect(groupTicket).to.be.empty;
          done()
        })
        .catch(e => done(e));
    });
  });

  describe('# addAction()', () => {
    let ticketId;
    const device = fixtures.emailDevice();

    beforeEach((done) => {
      build('ticket', fixtures.ticket())
        .then((ticket) => {
          ticketId = ticket.id;
          done();
        });
    });

    context('with valid input parameters', () => {
      it('adds an action successfully', (done) => {
        ticketService.addAction(ticketId, actionTypes.CREATED, userId, device)
          .then((ticket) => {
            expect(ticket.actions[0].actionTaken).to.equal(actionTypes.CREATED);
            expect(ticket.actions[0].device.name).to.equal(device.name);
            expect(ticket.actions[0].user.toString()).to.equal(userId);
            done();
          });
      });
    });

    context('with invalid input parameters', () => {
      it('fails to add an action', (done) => {
        ticketService.addAction(ticketId, 'testing', userId)
          .catch((err) => {
            expect(err.details[0].message)
              .to.equal('"actionType" must be one of [CREATED, PAGE_SENT, ACKNOWLEDGED, REJECTED, CLOSED]');
            done();
          });
      });
    });
  });

  describe('# removeAction()', () => {
    let ticketId;
    let actionId;

    const action = {
      actionTaken: actionTypes.CREATED,
      user: userId,
      timestamp: Date.now()
    };

    beforeEach((done) => {
      const updates = { $set: { actions: [action] } };

      build('ticket', fixtures.ticket())
        .then((ticket) => {
          ticketId = ticket.id;
          Ticket.findByIdAndUpdate(ticketId, updates, { new: true }, (err, updatedTicket) => {
            if (updatedTicket) {
              actionId = updatedTicket.actions[0]._id.toString();
              done();
            }
          });
        });
    });

    context('with valid input parameters', () => {
      it('removes an action successfully', (done) => {
        ticketService.removeAction(ticketId, actionId)
          .then((ticket) => {
            expect(ticket.actions).to.be.empty;
            done();
          });
      });

      it('doesn\'t remove actions that don\'t match the search criteria', (done) => {
        ticketService.removeAction(ticketId, uuid.user)
          .then((ticket) => {
            expect(ticket.actions).to.have.length(1);
            expect(ticket.actions[0].actionTaken).to.equal(actionTypes.CREATED);
            expect(ticket.actions[0].user.toString()).to.equal(userId);
            done();
          });
      });
    });
  });
});
