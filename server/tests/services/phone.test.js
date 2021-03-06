import phoneService from '../../services/phone';
import config from '../../../config/env';
import { build, fixtures } from '../../utils/factories';

describe('## Phone Service', () => {
  const VALID_TO_NUMBER = '+15005550006';

  describe('# Call', () => {
    const INVALID_NUMBER = '+15005550001';
    const INVALID_NUMBER_ERROR_CODE = 21217;

    let phoneDevice;

    before((done) => {
      build('device', fixtures.phoneDevice({ contactInformation: VALID_TO_NUMBER }))
        .then((device) => {
          phoneDevice = device;
          done();
        });
    });

    it('should successfully make a phone call', (done) => {
      phoneService.makeCall(null, null, phoneDevice)
        .then((callInfo) => {
          expect(callInfo).to.exist;
          expect(callInfo.status).to.equal('queued');
          done();
        });
    });

    it('should fail to call an invalid number', (done) => {
      const invalidNumberDevice = phoneDevice;
      invalidNumberDevice.contactInformation = INVALID_NUMBER;

      phoneService.makeCall(null, null, invalidNumberDevice)
        .catch((err) => {
          expect(err.code).to.equal(INVALID_NUMBER_ERROR_CODE);
          expect(err.message).to.equal(`${INVALID_NUMBER} does not appear to be a valid phone number`);
          done();
        });
    });
  });

  describe('# SMS', () => {
    const INVALID_NUMBER = '+15005550001';
    const INVALID_NUMBER_ERROR_CODE = 21211;

    const CANT_ROUTE_NUMBER = '+15005550002';
    const CANT_ROUTE_NUMBER_ERROR_CODE = 21612;

    let smsDevice;
    let ticket;

    before((done) => {
      const pProm = build('device', fixtures.phoneDevice({ contactInformation: VALID_TO_NUMBER }));
      const tProm = build('ticket', fixtures.ticket());
      Promise.all([pProm, tProm])
        .then((results) => {
          smsDevice = results[0];
          ticket = results[1];
          done();
        });
    });

    it('should successfully send a sms message', (done) => {
      phoneService.sendMessage(ticket, null, smsDevice)
        .then((messageInfo) => {
          expect(messageInfo).to.exist;
          expect(messageInfo.status).to.equal('queued');
          done();
        });
    });

    it('should fail to text an invalid number', (done) => {
      const invalidNumberDevice = smsDevice;
      invalidNumberDevice.contactInformation = INVALID_NUMBER;

      phoneService.sendMessage(ticket, null, invalidNumberDevice)
        .catch((err) => {
          expect(err.code).to.equal(INVALID_NUMBER_ERROR_CODE);
          expect(err.message).to.equal(`The \'To\' number ${INVALID_NUMBER} is not a valid phone number.`);
          done();
        });
    });

    it('should fail to text a number twilio can\'t route to', (done) => {
      const routeNumberDevice = smsDevice;
      routeNumberDevice.contactInformation = CANT_ROUTE_NUMBER;

      phoneService.sendMessage(ticket, null, routeNumberDevice)
        .catch((err) => {
          expect(err.code).to.equal(CANT_ROUTE_NUMBER_ERROR_CODE);
          expect(err.message).to.equal(
            `The \'To\' phone number: ${CANT_ROUTE_NUMBER}, is not currently reachable using the \'From\' phone number: ${config.twilio.fromPhone} via SMS.`);
          done();
        });
    });
  });
});
