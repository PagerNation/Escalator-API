import Group from '../../models/group';
import User from '../../models/user';
import EscalationPolicy from '../../models/escalationPolicy';

describe('## Group Model', () => {
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

  describe('# group user modifications', () => {
    const baseGroup = {
      name: 'Wondertwins',
      users: []
    };

    const newUser = new User({
      name: 'Bryon Wilkins',
      email: 'bwilks@gmail.com'
    });

    beforeEach((done) => {
      Group.create(baseGroup)
        .then((createdGroup) => {
          expect(createdGroup).to.exist;
          group = createdGroup;
          done();
        });
    });

    it('should add a user to the group', (done) => {
      group.addUser(newUser.id)
        .then((receivedGroup) => {
          expect(receivedGroup).to.exist;
          expect(receivedGroup.name).to.equal(baseGroup.name);
          expect(receivedGroup.users).to.not.be.empty;
          done();
        });
    });

    it('should remove a user from the group', (done) => {
      group.addUser(newUser.id)
        .then(modifiedGroup => expect(modifiedGroup.users[0]).to.exist)
        .then(() => group.removeUser(newUser.id))
        .then((receivedGroup) => {
          expect(receivedGroup).to.exist;
          expect(receivedGroup.users).to.be.empty;
          done();
        });
    });
  });
});
