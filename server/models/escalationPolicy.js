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
    type: [{
      userId: mongoose.Schema.Types.ObjectId,
      active: {
        type: mongoose.Schema.Types.Boolean,
        default: true
      },
      deactivateDate: {
        type: mongoose.Schema.Types.Date,
        default: null
      },
      reactivateDate: {
        type: mongoose.Schema.Types.Date,
        default: null
      }
    }],
    default: []
  }
});

EscalationPolicySchema.statics = {
  defaultEscalationPolicy() {
    return new this();
  }
};

export default mongoose.model('EscalationPolicy', EscalationPolicySchema);
