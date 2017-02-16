import mongoose from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';
import EscalationPolicy from './escalationPolicy';
import APIError from '../helpers/APIError';

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  users: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  escalationPolicy: {
    type: EscalationPolicy.schema,
    default: EscalationPolicy.defaultEscalationPolicy()
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
});

GroupSchema.methods = {
  addUser(userId) {
    this.users.push(userId);
    this.markModified('users');

    return new Promise((resolve, reject) => {
      this.save((err, group) => {
        if (err) {
          reject(err);
        }
        resolve(group);
      });
    });
  },

  removeUser(userId) {
    _.remove(this.users, n => n.toString() === userId);
    this.markModified('users');

    return new Promise((resolve, reject) => {
      this.save((err, group) => {
        if (err) {
          reject(err);
        }

        resolve(group);
      });
    });
  }
};

GroupSchema.statics = {
  get(name) {
    return new Promise((resolve, reject) => {
      this.findOne({ name }, (err, group) => {
        if (group) {
          resolve(group);
        }
        const error = new APIError('No such group exists', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  },

  delete(name) {
    return new Promise((resolve, reject) => {
      this.findOneAndRemove({ name }, (err, group) => {
        if (group) {
          resolve();
        }
        const error = new APIError('No such group exists', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  },

  updateEscalationPolicy(name, updates) {
    return new Promise((resolve, reject) => {
      this.findOneAndUpdate({ name }, { $set: updates }, { new: true }, (err, group) => {
        if (err) {
          reject(err);
        }
        resolve(group);
      });
    });
  },

  addAdmin(name, userId) {
    return new Promise((resolve, reject) => {
      const update = { $push: { admins: userId } };
      this.findOneAndUpdate({ name }, update, { new: true }, (err, group) => {
        if (err) {
          reject(err);
        }
        resolve(group);
      });
    });
  }
};

export default mongoose.model('Group', GroupSchema);
