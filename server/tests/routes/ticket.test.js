import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import { build, fixtures } from '../../utils/factories';

describe('## Ticket APIs', () => {
  const ticket = fixtures.ticket();

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
        .post('/api/v1/ticket')
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
        .get(`/api/v1/ticket/${createdTicket.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.groupName).to.equal(ticket.groupName);
          expect(res.body.metadata.message).to.equal(ticket.metadata.message);
          done();
        });
    });

    it('should report error with message - Not found, when ticket does not exists', (done) => {
      request(app)
        .get('/api/v1/ticket/56c787ccc67fc16ccc1a5e92')
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
        .put(`/api/v1/ticket/${createdTicket.id}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.metadata.message).to.equal(updateDetails.metadata.message);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`/api/v1/ticket/${createdTicket.id}`)
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
        .delete(`/api/v1/ticket/${createdTicket.id}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`/api/v1/ticket/${createdTicket.id}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });
  });
});
