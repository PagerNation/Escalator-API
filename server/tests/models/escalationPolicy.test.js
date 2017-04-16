import mongoose from 'mongoose';
import EscalationPolicy from '../../models/escalationPolicy';
import { build, fixtures } from '../../utils/factories';

describe('## EscalationPolicy: models', () => {
  const epObj = fixtures.escalationPolicy();

  context('valid group', () => {
    it('should create a new EscalationPolicy', (done) => {
      new EscalationPolicy(epObj).save((err, createdEP) => {
        const subscriber = createdEP.subscribers[0];
        expect(createdEP.rotationIntervalInDays).to.equal(epObj.rotationIntervalInDays);
        expect(createdEP.subscribers.length).to.equal(1);
        expect(subscriber.user.toString()).to.equal(epObj.subscribers[0].user.toString());
        expect(subscriber.active).to.equal(epObj.subscribers[0].active);
        expect(createdEP.pagingIntervalInMinutes).to.equal(epObj.pagingIntervalInMinutes);
        done();
      });
    });
  });

  it('should fail to create an EscalationPolicy object', (done) => {
    // Create EscalationPolicy object to pass to EscalationPolicy.save()
    const escalationPolicy = new EscalationPolicy({
      rotationIntervalInDays: 1,
      subscribers: 'wrong type'
    });

    escalationPolicy.save((err) => {
      expect(err).to.exist;
      expect(err.errors.subscribers.message).to.equal('Cast to Array failed for value "wrong type" at path "subscribers"');
      done();
    });
  });
});
