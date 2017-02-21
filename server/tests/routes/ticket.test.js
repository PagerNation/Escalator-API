import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import authService from '../../services/auth';
import { build, fixtures } from '../../utils/factories';

describe('## Ticket APIs', () => {
  const ticket = fixtures.ticket();
  const basePath = '/api/v1/ticket';
  const userObj = fixtures.user();
  let token;

  const invalidTicket = {
    metadata: {
      description: 'Something bad!',
    }
  };

  beforeEach((done) => {
    build('user', userObj)
      .then(u => authService.loginUser(u.email))
      .then((authObject) => {
        token = authObject.token;
        done();
      });
  });

  describe('# POST /api/v1/ticket', () => {
    it('should create a new ticket', (done) => {
      request(app)
        .post('/api/v1/ticket')
        .set('Authorization', `Bearer ${token}`)
        .send(ticket)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.groupName).to.equal(ticket.groupName);
          expect(res.body.metadata.description).to.equal(ticket.metadata.description);
          done();
        });
    });

    it('should fail with status 400 with invalid ticketObject', (done) => {
      request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.groupName).to.equal(ticket.groupName);
          expect(res.body.metadata.description).to.equal(ticket.metadata.description);
          done();
        });
    });

    it('should report error with message - Not found, when ticket does not exists', (done) => {
      request(app)
        .get(`${basePath}/56c787ccc67fc16ccc1a5e92`)
        .set('Authorization', `Bearer ${token}`)
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
        title: 'Something else!',
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
        .set('Authorization', `Bearer ${token}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.metadata.title).to.equal(updateDetails.metadata.title);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`${basePath}/${createdTicket.id}`)
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`${basePath}/${createdTicket.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });
  });

  describe('# GET /api/v1/ticket/all?isOpen=...&groupName=...&to=...&from=...', () => {
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
        request(app)
          .get(`${basePath}/all`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(4);
            done();
          });
      });

      it('gets all tickets between two times', (done) => {
        request(app)
          .get(`${basePath}/all?to=3&from=2`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(2);
            done();
          });
      });

      it('gets all open tickets', (done) => {
        request(app)
          .get(`${basePath}/all?isOpen=1`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(3);
            done();
          });
      });

      it('gets all closed tickets', (done) => {
        request(app)
          .get(`${basePath}/all?isOpen=0`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(1);
            done();
          });
      });

      it('gets all tickets for a given group tickets', (done) => {
        request(app)
          .get(`${basePath}/all?groupName=t`)
          .set('Authorization', `Bearer ${token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.have.lengthOf(1);
            done();
          });
      });
    });
  });
});
