import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import userService from '../../services/user';


describe('## User APIs', () => {
  describe('# POST /api/v1/user', () => {
    const user = {
      name: 'Jarryd Lee',
      email: 'abc@google.com'
    };

    const invalidUser = {
      name: 'Jarryd Lee',
      email: 0
    };

    it('should create a new user', (done) => {
      request(app)
        .post('/api/v1/user')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(user.name);
          expect(res.body.email).to.equal(user.email);
          done();
        });
    });

    it('should fail with status 400 with invalid userObject', (done) => {
      request(app)
        .post('/api/v1/user')
        .send(invalidUser)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"email" must be a string');
          done();
        });
    });
  });

  describe('# GET /api/v1/user/:userId', () => {
    let user = {
      name: 'Jarryd Lee',
      email: 'Jarryd@lee.com'
    };

    before((done) => {
      userService.createUser(user)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should get a user', (done) => {
      request(app)
        .get(`/api/v1/user/${user._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(user.name);
          expect(res.body.email).to.equal(user.email);
          done();
        });
    });

    it('should report error with message - Not found, when user does not exist', (done) => {
      request(app)
        .get('/api/v1/user/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });

  describe('# PUT /api/v1/user/:userId', () => {
    const uncreatedUser = {
      name: 'Jarryd Lee',
      email: 'Jarryd@lee.com'
    };

    let user;

    const updateDetails = {
      email: 'update@email.com'
    };

    beforeEach((done) => {
      userService.createUser(uncreatedUser)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('should update user details', (done) => {
      request(app)
        .put(`/api/v1/user/${user._id}`)
        .send(updateDetails)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.email).to.equal(updateDetails.email);
          done();
        });
    });

    it('should report error with message for any invalid field', (done) => {
      request(app)
        .put(`/api/v1/user/${user._id}`)
        .send({ fake: 0 })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"fake" is not allowed');
          done();
        });
    });
  });

  describe('# DELETE /api/v1/user/:userId', () => {
    let user = {
      name: 'Jarryd Lee',
      email: 'Jarryd@lee.com'
    };

    before((done) => {
      userService.createUser(user)
        .then((createdUser) => {
          user = createdUser;
          done();
        });
    });

    it('deletes a user', (done) => {
      request(app)
        .delete(`/api/v1/user/${user._id}`)
        .expect(httpStatus.OK)
        .then(() => {
          request(app)
            .get(`/api/v1/user/${user._id}`)
            .expect(httpStatus.NOT_FOUND)
            .then(() => done());
        });
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .delete('/api/v1/user/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        });
    });
  });
});
