import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/user';
import userCtrl from '../controllers/user';
import userMiddleware from '../middlewares/user';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/')
  .post(validate(paramValidation.createUser), userCtrl.createUser);

router.route('/:userId')
  .get(validate(paramValidation.byId), userCtrl.getUser)
  .put(userMiddleware.validateByRole, userCtrl.updateUser)
  .delete(validate(paramValidation.byId), userCtrl.deleteUser);

router.route('/:userId/device')
  .post(validate(paramValidation.addDevice), userCtrl.addDevice);

router.route('/:userId/device/:deviceId')
  .get(validate(paramValidation.deviceById), userCtrl.getDevice)
  .put(validate(paramValidation.updateDevice), userCtrl.updateDevice)
  .delete(validate(paramValidation.deviceById), userCtrl.removeDevice);

router.route('/:userId/devices')
  .put(validate(paramValidation.deviceById), userCtrl.sortDevices);

router.route('/:userId/group')
  .get(validate(paramValidation.byId), userCtrl.getGroupsForUser);

export default router;
