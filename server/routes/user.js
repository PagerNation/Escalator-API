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

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

export default router;
