import Group from '../../models/group';
import EscalationPolicy from '../../models/escalationPolicy';

describe('## Groups', () => {
  const subscriberRotationInterval = 7;
  const subscriberPagingInterval = 15;
  const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

  const escPolicy = {
    rotationInterval: subscriberRotationInterval,
    subscribers: [{
      subId: subscriberObjectId,
      pagingInterval: subscriberPagingInterval
    }]
  };

  const userObjectId = '67e590a0140ebf1cc48bb1bf';
  let group = null;

  context('# with a valid group', () => {
    const groupData = {
      name: 'Wondertwins',
      users: [userObjectId],
      escalationPolicy: escPolicy
    };

    it('should create a new group', (done) => {
      new Group(groupData).save((err, newGroup) => {
        expect(err).to.not.exist;
        expect(newGroup.name).to.equal(groupData.name);
        expect(newGroup.users[0].toString()).to.equal(groupData.users[0]);
        done();
      });
    });
  });

  context('# when name is not there', () => {
    const groupData = {
      users: [userObjectId],
      escalationPolicy: escPolicy
    };

    before(() => {
      group = new Group(groupData);
    });

    it('should not create a new group', (done) => {
      group.save((err, newGroup) => {
        expect(err).to.exist;
        expect(err.errors.name.message).to.equal('Path `name` is required.');
        done();
      });
    });
  });

  context('# when users is not there', () => {
    const groupData = {
      name: 'Wondertwins',
      escalationPolicy: escPolicy
    };

    before(() => {
      group = new Group(groupData);
    });

    it('should not create a new group', (done) => {
      group.save((err, newGroup) => {
        expect(err).to.exist;
        expect(err.errors.users.message).to.equal('Path `users` is required.');
        done();
      });
    });
  });
});
