import express from 'express';

import authRoutes from './auth';
import ticketRoutes from './ticket';
import userRoutes from './user';
import groupRoutes from './group';
import alertRoutes from './alert';
import twilioRoutes from './twilio';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount auth routes at /auth
router.use('/v1/auth', authRoutes);

// mount ticket routes at /ticket
router.use('/v1/ticket', ticketRoutes);

// mount user routes at /user
router.use('/v1/user', userRoutes);

// mount group routes at /group
router.use('/v1/group', groupRoutes);

router.use('/v1/alert', alertRoutes);

router.use('/v1/twilio', twilioRoutes);

export default router;
