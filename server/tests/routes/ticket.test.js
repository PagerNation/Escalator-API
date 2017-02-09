import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import { build, fixtures } from '../../utils/factories';

describe('## Ticket APIs', () => {
  const ticket = fixtures.ticket();
  const basePath = '/api/v1/ticket';

  const invalidTicket = {
    metadata: {
      message: 'Something bad!',
    }
  };

  describe('# POST /api/v1/ticket', () => {
    it('should create a new ticket', (done) => {
      request(app)
        .post('/api/v1/ticket')
        .send(ticket)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.groupName).to.equal(ticket.groupName);
          expect(res.body.metadata.message).to.equal(ticket.metadata.message);
          done();
        });
    });

    it('should fail with status 400 with invalid ticketObject', (done) => {
      request(app)
        .post(basePath)
        .send(invalidTicket)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"groupName" is required');
          done();
        });
    });
  });

  describe('# GET /api/v1/ticket/:ticketId', () => {
    let createdTicket;

    before((done) => {
      build('ticket', ticket)
        .then((t) => {
          createdTicket = t;
          done();
        });
    });

    it('should get a ticket', (done) => {
      request(app)
        .get(`${basePath}/${createdTicket.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.groupName).to.equal(ticket.groupName);
          expect(res.body.metadata.message).to.equal(ticket.metadata.message);
          done();
        });
    });

    it('should report error with message - Not found, when ticket does not exists', (done) => {
      request(app)
        .get(`${basePath}/56c787ccc67fc16ccc1a5e92`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });

  describe('# PUT /api/v1/ticket/:ticketId', () => {
    const updateDetails = fixtures.ticket({
      metadata: {
        message: 'Something else!',
      }
    });

    let createdTicket;
    before((done) => {
      build('ticket', ticket)
        .then((t) => {
          createdTicket = t;
          done();
        });
    });

    it('should update ticket details', (done) => {
      request(app)
        .put(`${basePath}/${createdTicket.id}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.metadata.message).to.equal(updateDetails.metadata.message);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`${basePath}/${createdTicket.id}`)
        .send({ fake: 0 })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"groupName" is required and "metadata" is required');
          done();
        });
    });
  });

  describe('# DELETE /api/v1/ticket/:ticketId', () => {
    let createdTicket;
    before((done) => {
      build('ticket', ticket)
        .then((t) => {
          createdTicket = t;
          done();
        });
    });

    it('deletes a ticket', (done) => {
      request(app)
        .delete(`${basePath}/${createdTicket.id}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`${basePath}/${createdTicket.id}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });
  });

  describe('# GET /api/v1/ticket/all?isOpen=...&groupName=...&to=...&from=...', () => {
    beforeEach((done) => {
      const promiseChain = [];
      for (var i = 0; i < 3; i++) {
        let ticketPromise = build('ticket', fixtures.ticket({ createdAt: i }));
        promiseChain.push(ticketPromise);
      }

      promiseChain.push(build('ticket', fixtures.ticket({ isOpen: false, groupName: 't', createdAt: 3 })));

      Promise.all(promiseChain)
        .then(() => done());
    });

    context('with valid filters', () => {
      it('gets all tickets', (done) => {
        request(app)
          .get(`${basePath}/all`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(4);
            done();
          });
      });

      it('gets all tickets between two times', (done) => {
        request(app)
          .get(`${basePath}/all?to=3&from=2`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(2);
            done();
          });
      });

      it('gets all open tickets', (done) => {
        request(app)
          .get(`${basePath}/all?isOpen=1`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(3);
            done();
          });
      });

      it('gets all closed tickets', (done) => {
        request(app)
          .get(`${basePath}/all?isOpen=0`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(1);
            done();
          });
      });

      it('gets all tickets for a given group tickets', (done) => {
        request(app)
          .get(`${basePath}/all?groupName=t`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(1);
            done();
          });
      });
    });
  });
});
