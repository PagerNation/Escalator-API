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
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

DeviceSchema.virtual('id').get(function () {
  return this._id.toString();
});

export default mongoose.model('Device', DeviceSchema);
