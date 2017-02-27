import mongoose from 'mongoose';
import EscalationPolicy from '../../models/escalationPolicy';

describe('## EscalationPolicy: models', () => {
  it('should create a new EscalationPolicy', (done) => {
    const subscriberRotationIntervalInDays = 7;
    const subscriberPagingIntervalInMinutes = 15;
    const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

    // Create EscalationPolicy object to pass to EscalationPolicy.create()
    const escalationPolicy = new EscalationPolicy({
      rotationIntervalInDays: subscriberRotationIntervalInDays, // 7 days
      pagingIntervalInMinutes: subscriberPagingIntervalInMinutes, // 15 minutes
      subscribers: [subscriberObjectId]
    });

    escalationPolicy.save((err, createdEP) => {
      // verify no error
      expect(err).to.not.exist;
      // verify all fields were saved and have correct information
      expect(createdEP.rotationIntervalInDays).to.equal(subscriberRotationIntervalInDays);
      expect(createdEP.subscribers.length).to.equal(1);
      expect(createdEP.subscribers[0].toString())
        .to.equal(subscriberObjectId);
      expect(createdEP.pagingIntervalInMinutes).to.equal(subscriberPagingIntervalInMinutes);
      done();
    });
  });

  it('should fail to create an EscalationPolicy object', (done) => {
    // Create EscalationPolicy object to pass to EscalationPolicy.save()
    const escalationPolicy = new EscalationPolicy({
      rotationIntervalInDays: 1,
      subscribers: 'wrong type'
    });

    escalationPolicy.save((err, createdEscalationPolicy) => {
      expect(err).to.exist;
      expect(err.errors.subscribers.message).to.equal('Cast to Array failed for value "wrong type" at path "subscribers"');
      done();
    });
  });
});
