import chai, { expect } from 'chai';
import User from '../../models/user';

chai.config.includeStack = true;

describe('# User Model', () =>{
  let user = new User({
    name: 'Kaleb Davis',
    email: 'abc@google.com',
    role: 1
  });

  before(() =>{
    User.remove({}, () =>{});
  });
  
  it('creates a user', (done) => {
    User.create(user, (err, u) => {
      expect(err).to.not.exist;

      expect(u.name).to.equal(user.name);
      expect(u.email).to.equal(user.email);
      expect(u.role).to.equal(user.role);
      done();
    });
  });

  it("throws an error when the email is not valid", (done) => {
    var badEmail = 'hello';
    user.email = badEmail;
    User.create(user, (err, u) => {
      expect(err).to.exist;
      expect(err.errors['email'].message).to.equal(badEmail + ' is not a valid email address');
      done();
    });
  });

  it("throws an error when a required field doesn't exist", (done) => {
    user.name = null;
    User.create(user, (err, u) => {
      expect(err).to.exist;
      done();
    });
  });
});
