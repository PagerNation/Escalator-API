import express from 'express';

import twilioController from '../controllers/twilio';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/')
  .get(twilioController.buildResponse);

export default router;
