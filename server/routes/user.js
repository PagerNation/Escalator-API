import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/user';
import userCtrl from '../controllers/user';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/')
  .post(validate(paramValidation.createUser), userCtrl.createUser);

router.route('/:userId')
  .get(validate(paramValidation.byId), userCtrl.getUser)
  .put(validate(paramValidation.updateUser), userCtrl.updateUser)
  .delete(validate(paramValidation.byId), userCtrl.deleteUser);

router.route('/:userId/device')
  .post(validate(paramValidation.addDevice), userCtrl.addDevice);

router.route('/:userId/device/:deviceId')
  .get(validate(paramValidation.deviceById), userCtrl.getDevice)
  .put(validate(paramValidation.updateDevice), userCtrl.updateDevice)
  .post(validate(paramValidation.deviceById), userCtrl.sortDevices)
  .delete(validate(paramValidation.deviceById), userCtrl.removeDevice);

router.route('/:userId/group')
  .get(validate(paramValidation.byId), userCtrl.getGroupsForUser);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.loadUser);

export default router;
