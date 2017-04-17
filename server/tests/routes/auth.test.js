import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import app from '../../../index';
import { fixtures, build } from '../../utils/factories';
import User from '../../models/user';

const authUrl = '/api/v1/auth';

describe('## Auth API', () => {
  let user;

  beforeEach((done) => {
    build('user', fixtures.user())
      .then((userObj) => {
        user = userObj;
        done();
      });
  });

  describe('# /api/v1/auth/login', () => {
    it('logs a user in', (done) => {
      request(app)
        .post(`${authUrl}/login`)
        .send({
          email: user.email,
          password: 'anything'
        })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user.name).to.equal(user.name);
          expect(res.body.user.email).to.equal(user.email);
          done();
        });
    });

    it('doesn\'t log in a user that doesn\'t exist', (done) => {
      request(app)
        .post(`${authUrl}/login`)
        .send({
          email: 'email',
          password: 'anything'
        })
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          done();
        });
    });
  });

  describe('# /api/v1/auth/signup', () => {
    const baseUser = {
      name: 'Jarryd',
      email: 'test@test.com',
      password: 'anything'
    };

    it('creates a new user', (done) => {
      request(app)
        .post(`${authUrl}/signup`)
        .send(baseUser)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.user.name).to.equal(baseUser.name);
          expect(res.body.user.email).to.equal(baseUser.email);
          done();
        });
    });

    context('with an email that has already been used', () => {
      beforeEach((done) => {
        build('user', baseUser)
          .then((userObj) => {
            done();
          });
      });

      it('fails if the email already exists', (done) => {
        request(app)
          .post(`${authUrl}/signup`)
          .send({
            name: 'Jarryd1',
            email: baseUser.email,
            password: 'anything'
          })
          .expect(httpStatus.BAD_REQUEST)
          .then((res) => {
            done();
          });
      });
    });
  });
});
