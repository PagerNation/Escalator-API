import mongoose from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';
import EscalationPolicy from './escalationPolicy';
import APIError from '../helpers/APIError';

/**
 * Group Schema
 *
 * id - default id given by mongodb
 * name - name of the group, must be unique
 * users - list of user objects that are included in the group
 * escalationPolicy - escalation policy for this group
 */

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
    default: null
  }
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
  /**
   * Get a group
   * @param {name} - the name of the group
   * @return {Promise<Group, APIError>}
   */
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

  /**
   * Delete a group
   * @param {name} - the name of the group
   * @return {Promise<APIError>}
   */
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
  }
};

export default mongoose.model('Group', GroupSchema);
