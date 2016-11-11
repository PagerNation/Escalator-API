import Device from '../../models/device';
import { fixtures } from '../factories';

describe('# Device Model', () => {
  context('given a valid device', () => {
    const device = fixtures.email_device();

    it('creates a devices', (done) => {
      Device.create(device, (err, d) => {
        expect(err).to.not.exist;
        expect(d.name).to.equal(device.name);
        expect(d.type).to.equal(device.type);
        expect(d.contactInformation).to.equal(device.contactInformation);
        done();
      });
    });
  });

  context('when the type is not an enum', () => {
    const device = fixtures.email_device({ type: 'pidgeon' });

    it('throws a type error', (done) => {
      Device.create(device, (err, d) => {
        expect(err).to.exist;
        expect(err.errors.type.message).to.equal(`\`${device.type}\` is not a valid enum value for path \`type\`.`);
        done();
      });
    });
  });

  context('when the name is not set', () => {
    const device = new Device({
      type: 'pidgeon'
    });

    it('throws a name error', (done) => {
      Device.create(device, (err, d) => {
        expect(err).to.exist;
        expect(err.errors.name.message).to.equal('Path `name` is required.');
        done();
      });
    });
  });
});
