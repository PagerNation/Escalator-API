import express from 'express';
import ticketRoutes from './ticket';
import userRoutes from './user';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/v1/ticket', ticketRoutes);
// mount user routes at /user
router.use('/v1/user', userRoutes);

export default router;
