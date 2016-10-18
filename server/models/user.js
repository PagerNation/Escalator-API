import mongoose from 'mongoose';
import EscalationPolicySchema from './escalationPolicy';

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    validate: {
      validator: v => emailRegex.test(v),
      message: '{VALUE} is not a valid email address'
    },
    required: true,
  },
  auth: String,
  escalationPolicy: {
    type: EscalationPolicySchema,
    default: null
  },
  groups: [mongoose.Schema.Types.ObjectId],
  devices: [{
    type: String,
    address: String,
    id: String,
    name: String
  }],
  role: {
    type: Number, // This can be an enum, should we make this an enum?
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', UserSchema);
