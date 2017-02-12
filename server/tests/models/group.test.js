import Group from '../../models/group';
import User from '../../models/user';
import EscalationPolicy from '../../models/escalationPolicy';
import { build, fixtures } from '../../utils/factories';

describe('## Group Model', () => {
  const subscriberRotationIntervalInDays = 7;
  const subscriberPagingIntervalInDays = 15;
  const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

  const escPolicy = {
    rotationIntervalInDays: subscriberRotationIntervalInDays,
    pagingIntervalInDays: subscriberPagingIntervalInDays,
    subscribers: [subscriberObjectId]
  };

  const userObjectId = '67e590a0140ebf1cc48bb1bf';
  let group = null;

  context('# with a valid group', () => {
    const groupData = {
      name: 'Wondertwins',
      users: [userObjectId],
    };

    it('should create a new group', (done) => {
      new Group(groupData).save((err, newGroup) => {
        const compareEP = EscalationPolicy.defaultEscalationPolicy();
        const newGroupEP = newGroup.escalationPolicy;
        expect(err).to.not.exist;
        expect(newGroup.name).to.equal(groupData.name);
        expect(newGroup.users[0].toString()).to.equal(groupData.users[0]);
        expect(newGroupEP.pagingIntervalInDays).to.equal(compareEP.pagingIntervalInDays);
        expect(newGroupEP.rotationIntervalInDays).to.equal(compareEP.rotationIntervalInDays);
        expect(newGroupEP.subscribers).to.be.empty;
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
    const baseGroup = fixtures.group({
      users: []
    });

    const newUser = new User({
      name: 'Bryon Wilkins',
      email: 'bwilks@gmail.com'
    });

    beforeEach((done) => {
      build('group', baseGroup)
        .then((newGroup) => {
          group = newGroup;
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
