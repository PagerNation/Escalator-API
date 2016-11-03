import express from 'express';
import ticketRoutes from './ticket';
import userRoutes from './user';
import groupRoutes from './group';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/v1/ticket', ticketRoutes);
// mount user routes at /user
router.use('/v1/user', userRoutes);

// mount group routes at /group
router.use('/v1/group', groupRoutes);

export default router;
