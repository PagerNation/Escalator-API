import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/user';
import userCtrl from '../controllers/user';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/')

  /** POST /api/v1/user - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.createUser);

router.route('/:userId')

  /** GET /api/v1/user/:userId - Get user */
  .get(validate(paramValidation.byId), userCtrl.getUser)

  /** PUT /api/v1/user/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.updateUser)

  /** DELETE /api/v1/user/:userId - Delete user */
  .delete(validate(paramValidation.byId), userCtrl.deleteUser);

router.route('/:userId/device')
  /** POST /api/v1/user/:userId/device - Add device to user */
  .post(validate(paramValidation.addDevice), userCtrl.addDevice);

router.route('/:userId/device/:deviceId')

  /** GET /api/v1/user/:userId/device/:deviceId - Get device from user */
  .get(validate(paramValidation.deviceById), userCtrl.getDevice)

  /** PUT /api/v1/user/:userId/device/:deviceId - Update device ordering */
  .put(validate(paramValidation.deviceById), userCtrl.sortDevices)

  /** DELETE /api/v1/user/:userId/device/:deviceId - Delete device from user */
  .delete(validate(paramValidation.deviceById), userCtrl.removeDevice);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.loadUser);

export default router;
