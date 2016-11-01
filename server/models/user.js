import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import EscalationPolicySchema from './escalationPolicy';
import Device from './device';

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
  auth: {
    type: String,
    default: null
  },
  escalationPolicy: {
    type: EscalationPolicySchema,
    default: null
  },
  groups: [mongoose.Schema.Types.ObjectId],
  devices: [Device.schema],
  role: {
    type: Number, // This can be an enum, should we make this an enum?
    default: 0,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return new Promise((resolve, reject) => {
      this.findById(id, (err, user) => {
        if (user) {
          resolve(user);
        }
        const error = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  },

  /**
   * Delete user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<APIError>}
   */
  delete(id) {
    return new Promise((resolve, reject) => {
      this.findByIdAndRemove(id, (err, user) => {
        if (user) {
          resolve();
        }
        const error = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  }
};

export default mongoose.model('User', UserSchema);
