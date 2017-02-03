import { actionTypes } from '../../models/ticket';
import { fixtures, build } from '../../utils/factories';
import pageLogService from '../../services/pageLog';
import Ticket from '../../models/ticket';

describe('## PageLogService', () => {
  const userId = '123456789098765432123456';
  let ticketId;

  beforeEach((done) => {
    build('ticket', fixtures.ticket())
      .then((ticket) => {
        ticketId = ticket.id;
        done();
      });
  });

  describe('# addAction()', () => {
    context('with valid input parameters', () => {
      it('adds an action successfully', (done) => {
        pageLogService.addAction(ticketId, actionTypes.CREATED, userId)
          .then((ticket) => {
            expect(ticket.actions[0].actionTaken).to.equal(actionTypes.CREATED);
            expect(ticket.actions[0].userId.toString()).to.equal(userId);
            done();
          });
      });
    });

    context('with invalid input parameters', () => {
      it('fails to add an action', (done) => {
        pageLogService.addAction(ticketId, 'testing', userId)
          .catch((err) => {
            expect(err.details[0].message)
              .to.equal('"actionType" must be one of [CREATED, PAGE_SENT, ACKNOWLEDGED, REJECTED, CLOSED]');
            done();
          });
      });
    });
  });

  describe('# removeAction()', () => {
    const action = {
      actionTaken: actionTypes.CREATED,
      userId: userId,
      timestamp: Date.now()
    };

    beforeEach((done) => {
      Ticket.findByIdAndUpdate(ticketId, { $set: { actions: [action]}}, { new: true }, (err, ticket) => {
        if (ticket) {
          done();
        }
      });
    });

    context('with valid input parameters', () => {
      it('removes an action successfully', (done) => {
        pageLogService.removeAction(ticketId, action.actionTaken, action.timestamp, action.userId)
          .then((ticket) => {
            expect(ticket.actions).to.be.empty;
            done();
          });
      });

      it('doesn\'t remove actions that don\'t match the search criteria', (done) => {
        pageLogService.removeAction(ticketId, actionTypes.CLOSED, action.timestamp, action.userId)
          .then((ticket) => {
            expect(ticket.actions).to.have.length(1);
            expect(ticket.actions[0].actionTaken).to.equal(actionTypes.CREATED);
            expect(ticket.actions[0].userId.toString()).to.equal(userId);
            done();
          });
      });
    });

    context('with invalid input parameters', () => {
      it('fails to remove an action', (done) => {
        pageLogService.removeAction(ticketId, 'testing', action.timestamp)
          .catch((err) => {
            expect(err.details[0].message)
              .to.equal('"actionType" must be one of [CREATED, PAGE_SENT, ACKNOWLEDGED, REJECTED, CLOSED]');
            done();
          });
      });
    });
  });
});
