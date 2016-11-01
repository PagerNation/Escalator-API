import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['email', 'phone', 'sms']
  },
  contactInformation: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Device', DeviceSchema);
