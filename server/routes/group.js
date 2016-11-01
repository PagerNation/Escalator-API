import express from 'express';
import validate from 'express-validation';
import paramValidation from './validation/group';
import groupCtrl from '../controllers/group';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  // creates a group with the given information
  .post(validate(paramValidation.createGroup), groupCtrl.createGroup);

router.route('/:groupName')

  // gets the group with the specified group name
  .get(validate(paramValidation.byName), groupCtrl.getGroup)

  // updates the group with the specified group name
  .put(validate(paramValidation.updateGroup), groupCtrl.updateGroup)

  // deletes the group with the specified group name
  .delete(validate(paramValidation.byName), groupCtrl.deleteGroup);

// Loads group when API with groupName parameter is hit
router.param('groupName', groupCtrl.load);

export default router;
