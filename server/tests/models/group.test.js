import Group from '../../models/group';
import User from '../../models/user';
import EscalationPolicy from '../../models/escalationPolicy';
import { equalDates } from '../helpers/dateHelper';
import { build, fixtures } from '../../utils/factories';

describe('## Group Model', () => {
  const subscriberRotationIntervalInDays = 7;
  const subscriberPagingIntervalInMinutes = 15;
  const subscriberObjectId = '57e590a0140ebf1cc48bb1bf';

  const escPolicy = {
    rotationIntervalInDays: subscriberRotationIntervalInDays,
    pagingIntervalInMinutes: subscriberPagingIntervalInMinutes,
    subscribers: [subscriberObjectId]
  };

  const userObjectId = '67e590a0140ebf1cc48bb1bf';
  let group;

  context('# with a valid group', () => {
    const groupData = {
      name: 'Wondertwins',
      users: [userObjectId],
      admins: [userObjectId]
    };

    it('should create a new group', (done) => {
      new Group(groupData).save((err, newGroup) => {
        const compareEP = EscalationPolicy.defaultEscalationPolicy();
        const newGroupEP = newGroup.escalationPolicy;
        expect(err).to.not.exist;
        expect(newGroup.name).to.equal(groupData.name);
        expect(newGroup.users[0].toString()).to.equal(groupData.users[0]);
        expect(newGroupEP.pagingIntervalInMinutes).to.equal(compareEP.pagingIntervalInMinutes);
        expect(newGroupEP.rotationIntervalInDays).to.equal(compareEP.rotationIntervalInDays);
        expect(newGroupEP.subscribers).to.be.empty;
        expect(equalDates(newGroup.lastRotated, new Date())).to.eq(true);
        done();
      });
    });
  });

  context('# with a passed in date', () => {
    const date = new Date(2018, 8, 15, 18, 56, 30);

    const groupObj = fixtures.group({ lastRotated: date });

    it('should create a new group with that date', (done) => {
      new Group(groupObj).save((err, newGroup) => {
        expect(newGroup.name).to.equal(groupObj.name);
        expect(equalDates(newGroup.lastRotated, date)).to.eq(true);
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

  describe('# get all groups', () => {
    const baseGroup = fixtures.group();

    beforeEach((done) => {
      build('group', baseGroup)
        .then(() => build('group', baseGroup))
        .then(() => build('group', baseGroup))
        .then(() => done());
    });

    it('should return 3 groups', (done) => {
      Group.getAllGroups()
        .then((groups) => {
          expect(groups).to.exist;
          expect(groups).to.have.lengthOf(3);
          done();
        });
    });
  });
});
