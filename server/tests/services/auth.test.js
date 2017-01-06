import authService from '../../services/auth';
import { build, fixtures } from '../../utils/factories';

describe('# Auth Service', () => {
  const userObj = fixtures.user();
  let user = {};

  beforeEach((done) => {
    build('user', userObj)
      .then((u) => {
        user = u;
        done();
      });
  });

  context('## Login User', () => {
    it('should return a user object and a token', (done) => {
      authService.loginUser(userObj.email)
        .then((authObj) => {
          expect(authObj).to.exist;
          expect(authObj.user.email).to.equal(userObj.email);
          expect(authObj.token).to.exist;
          done();
        });
    });

    it('should return an error if the user does not exist', (done) => {
      authService.loginUser('NOT A USER')
        .catch((err) => {
          expect(err).to.exist;
          expect(err.message).to.equal('No such user exists!');
          done();
        });
    });
  });

  context('## Signup User', () => {
    it('should create a new user', (done) => {
      const newUserObj = {
        email: "new_user@test.com",
        name: "Test User"
      }
      authService.signupUser(newUserObj)
        .then((authObj) => {
          expect(authObj).to.exist;
          expect(authObj.user.email).to.equal(newUserObj.email);
          expect(authObj.token).to.exist;
          done();
        });
    });

    it('should not create a user that already exists', (done) => {
      const user = {
        email: userObj.email,
        name: userObj.name
      }
      authService.signupUser(user)
        .catch((err) => {
          expect(err).to.exist;
          expect(err.message).to.equal('User already exists');
          done();
        });
    });
  }); 
});
