import chai, { expect } from 'chai';
import mongoose from 'mongoose';
import EscalationPolicySchema from '../../models/escalationPolicy';

chai.config.includeStack = true;

describe('## EscalationPolicy: models', () => {
  let EscalationPolicyModel = mongoose.model('EscalationPolicy', new mongoose.Schema(EscalationPolicySchema));

  it('should create a new EscalationPolicy', (done) => {
    const subscriberRotationInterval = 7;
    const subscriberPagingInterval = 15;
    const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

    // Create EscalationPolicy object to pass to EscalationPolicy.create()
    const escalationPolicy = new EscalationPolicyModel({
      rotationInterval: subscriberRotationInterval, // 7 days
      pagingInterval: subscriberPagingInterval, // 15 minutes
      subscribers: [subscriberObjectId] // single element array with ObjectId in it
    });

    escalationPolicy.save((err, createdEscalationPolicy) => {
      // verify no error
      expect(err).to.not.exist;

      // verify all fields were saved and have correct information
      expect(createdEscalationPolicy.rotationInterval).to.equal(subscriberRotationInterval);
      expect(createdEscalationPolicy.pagingInterval).to.equal(subscriberPagingInterval);
      expect(createdEscalationPolicy.subscribers.length).to.equal(1);
      expect(createdEscalationPolicy.subscribers[0].toString()).to.equal(subscriberObjectId);

      // this test is finished
      done();
    });
  });

  it('should fail to create an EscalationPolicy object', (done) => {
    // Create EscalationPolicy object to pass to EscalationPolicy.create()
    const escalationPolicy = new EscalationPolicyModel({
      rotationInterval: 'subscriberRotationInterval',
      pagingInterval: 'subscriberPagingInterval',
      subscribers: 'wrong type'
    });

    escalationPolicy.save((err, createdEscalationPolicy) => {
      expect(err).to.exist;
    });

    done();
  });
});
