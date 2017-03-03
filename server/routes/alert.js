import express from 'express';
import alertCtrl from '../controllers/alert';
import queueMiddleware from '../middlewares/queue';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .post(queueMiddleware.isQueue, alertCtrl.sendPage);

export default router;
