import express from 'express';
import validate from 'express-validation';

import paramValidation from './validation/auth';
import authCtrl from '../controllers/auth';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/login')
  .post(validate(paramValidation.byEmailAndPassword), authCtrl.loginUser);

router.route('/signup')
  .post(validate(paramValidation.createUser), authCtrl.signupUser);

export default router;
