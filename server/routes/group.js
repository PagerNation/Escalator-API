import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/group';
import groupCtrl from '../controllers/group';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .post(validate(paramValidation.createGroup), groupCtrl.createGroup);

router.route('/:groupName')
  .get(validate(paramValidation.byName), groupCtrl.getGroup)
  .put(validate(paramValidation.updateGroup), groupCtrl.updateGroup)
  .delete(validate(paramValidation.byName), groupCtrl.deleteGroup);

router.route('/:groupName/user')
  .post(validate(paramValidation.addUser), groupCtrl.addUser);

router.route('/:groupName/user/:userId')
  .delete(validate(paramValidation.userById), groupCtrl.removeUser);

// Loads group when API with groupName parameter is hit
router.param('groupName', groupCtrl.load);

export default router;
