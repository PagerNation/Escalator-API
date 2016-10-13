import { expect } from 'chai';
import EscalationPolicy from '../../models/EscalationPolicy';

describe('## EscalationPolicy: models', () => {
  it('should create a new EscalationPolicy', (done) => {
    const subscriberRotationInterval = 7;
    const subscriberPagingInterval = 15;
    const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

    // Create EscalationPolicy object to pass to EscalationPolicy.create()
    const escalationPolicy = {
      rotationInterval: subscriberRotationInterval, // 7 days
      pagingInterval: subscriberPagingInterval, // 15 minutes
      subscribers: [subscriberObjectId] // single element array with ObjectId in it
    }

    EscalationPolicy.create(escalationPolicy, (err, createdEscalationPolicy) => {
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
});
