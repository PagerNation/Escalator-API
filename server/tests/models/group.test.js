import { expect } from 'chai';
import Group from '../../models/group';
import EscalationPolicy from '../../models/escalationPolicy';

describe('Groups', () => {
  const subscriberRotationInterval = 7;
  const subscriberPagingInterval = 15;
  const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

  const userObjectId = '67e590a0140ebf1cc48bb1bf';

  context('with a valid group', () => {
    const escPolicy = {
      rotationInterval: subscriberRotationInterval,
      pagingInterval: subscriberPagingInterval,
      subscribers: [subscriberObjectId]
    }

    const groupData = {
      users: [userObjectId],
      escalationPolicy: escPolicy
    }

    const group = new Group(groupData);

    it('should create a new group', (done) => {
      group.save((err, group) => {
        expect(err).to.not.exist;
        expect(group.users).to.be.a('array');
        expect(group.escalationPolicy.subscribers).to.be.a('array');
        done();
      });
    });
  });

  context('when rotation interval is not there', () => {
    const escPolicy = {
      rotationInterval: null,
      pagingInterval: subscriberPagingInterval,
      subscribers: [subscriberObjectId]
    }

    const groupData = {
      users: [userObjectId],
      escalationPolicy: escPolicy
    }

    const group = new Group(groupData);

    it('should create a new group', (done) => {
      group.save((err, group) => {
        expect(err).to.not.exist;
        expect(group.users).to.be.a('array');
        expect(group.escalationPolicy.subscribers).to.be.a('array');
        done();
      });
    });
  });

  context('when escalation policy is not there', () => {
    const groupData = {
      users: [userObjectId],
    }

    const group = new Group(groupData);

    it('should not create a new group', (done) => {
      group.save((err, group) => {
        expect(err).to.exist;
        done();
      });
    });
  });

  context('when users is not there', () => {
    const escPolicy = {
      rotationInterval: subscriberRotationInterval,
      pagingInterval: subscriberPagingInterval,
      subscribers: [subscriberObjectId]
    }

    const groupData = {
      escalationPolicy: escPolicy
    }

    const group = new Group(groupData);

    it('should not create a new group', (done) => {
      group.save((err, group) => {
        expect(err).to.exist;
        done();
      });
    });
  });
});
