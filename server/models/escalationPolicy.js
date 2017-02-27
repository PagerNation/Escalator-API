import mongoose from 'mongoose';

const EscalationPolicySchema = new mongoose.Schema({
  rotationIntervalInDays: {
    type: Number,
    default: 7
  },
  pagingIntervalInMinutes: {
    type: Number,
    default: 10,
  },
  subscribers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
});

EscalationPolicySchema.statics = {
  defaultEscalationPolicy() {
    return new this();
  }
};

export default mongoose.model('EscalationPolicy', EscalationPolicySchema);
