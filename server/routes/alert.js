import express from 'express';
import alertCtrl from '../controllers/alert';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .post(alertCtrl.sendPage);

export default router;
