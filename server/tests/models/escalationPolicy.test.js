import mongoose from 'mongoose';
import EscalationPolicy from '../../models/escalationPolicy';

describe('## EscalationPolicy: models', () => {
  it('should create a new EscalationPolicy', (done) => {
    const subscriberRotationInterval = 7;
    const subscriberPagingInterval = 15;
    const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

    // Create EscalationPolicy object to pass to EscalationPolicy.create()
    const escalationPolicy = new EscalationPolicy({
      rotationInterval: subscriberRotationInterval, // 7 days
      subscribers: [{
        subId: subscriberObjectId,
        pagingInterval: subscriberPagingInterval, // 15 minutes
      }]
    });

    escalationPolicy.save((err, createdEscalationPolicy) => {
      // verify no error
      expect(err).to.not.exist;
      // verify all fields were saved and have correct information
      expect(createdEscalationPolicy.rotationInterval).to.equal(subscriberRotationInterval);
      expect(createdEscalationPolicy.subscribers.length).to.equal(1);
      expect(createdEscalationPolicy.subscribers[0].subId.toString())
        .to.equal(subscriberObjectId);
      expect(createdEscalationPolicy.subscribers[0].pagingInterval)
        .to.equal(subscriberPagingInterval);
      done();
    });
  });

  it('should fail to create an EscalationPolicy object', (done) => {
    // Create EscalationPolicy object to pass to EscalationPolicy.save()
    const escalationPolicy = new EscalationPolicy({
      rotationInterval: 1,
      subscribers: 'wrong type'
    });

    escalationPolicy.save((err, createdEscalationPolicy) => {
      expect(err).to.exist;
      expect(err.errors.subscribers.message).to.equal('Cast to Array failed for value "wrong type" at path "subscribers"');
      done();
    });
  });
});
