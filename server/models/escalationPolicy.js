import mongoose from 'mongoose';

/**
 * EscalationPolicy Schema
 *
 * rotationInterval - interval for rotating escalation policy subscribers
 * pagingInterval - interval between sending pages to next subscriber
 * subscribers - ordered list of users/devices to send alerts to
 */
const EscalationPolicySchema = new mongoose.Schema({
  rotationInterval: Number,
  pagingInterval: {
    type: Number,
    required: true
  },
  subscribers: [mongoose.Schema.Types.ObjectId]
});

export default mongoose.model('EscalationPolicy', EscalationPolicySchema);
