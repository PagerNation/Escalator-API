import mongoose from 'mongoose';
import chai from 'chai';
import User from '../models/user';
import Group from '../models/group';
import Ticket from '../models/ticket';

chai.config.includeStack = true;

global.expect = chai.expect;

afterEach((done) => {
  Promise.resolve(User.remove(() => {}))
    .then(() => Group.remove(() => {}))
    .then(() => Ticket.remove(() => {}))
    .then(() => done());
});

after((done) => {
  mongoose.connection.db.dropDatabase(() => {
    done();
  });
});
