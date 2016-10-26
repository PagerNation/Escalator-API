import chai, { expect } from 'chai';
import Device from '../../models/device';

chai.config.includeStack = true;

describe('# Device Model', () => {

  before(() => {
    Device.remove({}, () =>{});
  });

  after(() => {
    Device.remove({}, () =>{});
  });

  context('given a valid device', () => {

    let device = new Device({
      name: 'My Phone',
      type: 'email',
      contact_information: '555-555-5555'
    });

    it('creates a devices', (done) => {
      Device.create(device, (err, d) => {
        expect(err).to.not.exist;
        expect(d.name).to.equal(device.name);
        expect(d.type).to.equal(device.type);
        expect(d.contact_information).to.equal(device.contact_information);
        done();
      });
    });
  });

  context('when the type is not an enum', () => {

    let device = new Device({
      name: 'My Phone',
      type: 'pidgeon'
    });

    it('throws a type error', (done) => {
      Device.create(device, (err, d) => {
        expect(err).to.exist;
        expect(err.errors['type'].message).to.equal(`\`${device.type}\` is not a valid enum value for path \`type\`.`);
        done();
      });
    });
  });

  context('when the name is not set', () => {

    let device = new Device({
      type: 'pidgeon'
    });

    it('throws a name error', (done) => {
      Device.create(device, (err, d) => {
        expect(err).to.exist;
        expect(err.errors['name'].message).to.equal('Path `name` is required.');
        done();
      });
    });
  });
});
