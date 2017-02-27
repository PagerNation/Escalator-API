import mongoose from 'mongoose';
import chai from 'chai';

chai.config.includeStack = true;

global.expect = chai.expect;

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    done();
  });
});

