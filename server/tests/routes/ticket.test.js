import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../../../index';
import ticketService from '../../services/ticket';

chai.config.includeStack = true;

describe('## Ticket APIs', () => {
  let ticket = {
    groupId: '551137c2f9e1fac808a5f572',
    metadata: {
      message: 'Something bad!',
    }
  };

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
          expect(res.body.groupId).to.equal('551137c2f9e1fac808a5f572');
          expect(res.body.metadata.message).to.equal('Something bad!');
          ticket = res.body;
          done();
        });
    });

    it('should fail with status 400 with invalid ticketObject', (done) => {
      request(app)
        .post('/api/v1/ticket')
        .send(invalidTicket)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"groupId" is required');
          done();
        });
    });
  });

  describe('# GET /api/v1/ticket/:ticketId', () => {
    it('should get a ticket', (done) => {
      request(app)
        .get(`/api/v1/ticket/${ticket._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.groupId).to.equal(ticket.groupId);
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
    let ticket = {
      groupId: '551137c2f9e1fac808a5f572',
      metadata: {
        message: 'Something bad!',
      }
    };

    const updateDetails = {
      groupId: '551137c2f9e1fac808a5f572',
      metadata: {
        message: 'Something else!',
      }
    };

    before((done) => {
      ticketService.createTicket(ticket)
        .then((createdTicket) => {
          ticket = createdTicket;
          done();
        });
    });

    it('should update ticket details', (done) => {
      request(app)
        .put(`/api/v1/ticket/${ticket._id}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.metadata.message).to.equal(updateDetails.metadata.message);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`/api/v1/ticket/${ticket._id}`)
        .send({ fake: 0 })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"groupId" is required and "metadata" is required');
          done();
        });
    });
  });

  describe('# DELETE /api/v1/ticket/:ticketId', () => {
    let ticket = {
      groupId: '551137c2f9e1fac808a5f572',
      metadata: {
        message: 'Something bad!',
      }
    };

    before((done) => {
      ticketService.createTicket(ticket)
        .then((createdTicket) => {
          ticket = createdTicket;
          done();
        });
    });

    it('deletes a ticket', (done) => {
      request(app)
        .delete(`/api/v1/ticket/${ticket._id.toString()}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`/api/v1/ticket/${ticket._id.toString()}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });
  });
});
