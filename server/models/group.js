import mongoose from 'mongoose';
import EscalationPolicySchema from './escalationPolicy';

/**
 * Group Schema
 *
 * id - default id given by mongodb
 * users - list of user objects that are included in the group
 * escalationPolicy - escalation policy for this group
 */

const GroupSchema = new mongoose.Schema({
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  },
  escalationPolicy: {
    type: EscalationPolicySchema,
    required: true
  }
});

export default mongoose.model('Group', GroupSchema);
