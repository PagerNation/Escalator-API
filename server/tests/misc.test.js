import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../index';

describe('## Misc', () => {
  describe('# GET /api/health-check', () => {
    it('should return OK', (done) => {
      request(app)
        .get('/api/health-check')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).to.equal('OK');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/404', () => {
    it('should return 404 status', (done) => {
      request(app)
        .get('/api/404')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# Error Handling', () => {
    xit('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
      done();
    });

    xit('should handle express validation error - username is required', (done) => {
      done();
    });
  });
});
