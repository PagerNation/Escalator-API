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
  joinRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  admins: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    validate: {
      validator(array) {
        return array.length >= 1;
      },
      message: 'Group must have at least one admin'
    }
  },
  lastRotated: {
    type: mongoose.Schema.Types.Date,
    default: Date.now()
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
  },

  processJoinRequest(userId, isAccepted) {
    return new Promise((resolve, reject) => {
      if (!_.includes(this.joinRequests.map(id => id.toString()), userId)) {
        const error = new APIError('No request for user to join group', httpStatus.BAD_REQUEST);
        return reject(error);
      }

      let maybeAddUser = Promise.resolve();
      if (isAccepted) {
        maybeAddUser = this.addUser(userId);
      }

      maybeAddUser.then(() => {
        _.remove(this.joinRequests, id => id.toString() === userId);
        this.markModified('users');

        this.save((err, savedGroup) => {
          if (err) {
            reject(err);
          }

          resolve(savedGroup);
        });
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

  getAllGroups() {
    return new Promise((resolve, reject) => {
      this.find({}, (err, groups) => {
        if (groups) {
          resolve(groups);
        }
        reject(err);
      });
    });
  },

  searchByName(name) {
    return new Promise((resolve, reject) => {
      const query = new RegExp(name, 'i');
      this.find({ name: query })
        .limit(20)
        .exec((err, groups) => {
          if (groups) {
            resolve(groups);
          }
          reject(err);
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

  removeUserFromEscalationPolicy(name, userId) {
    return new Promise((resolve, reject) => {
      this.findOneAndUpdate({ name }, { $pull: { 'escalationPolicy.subscribers': userId} },
        { new: true }, (err, group) => {
        if (err) {
          reject(err);
        }
        resolve(group);
      });
    });
  },

  makeJoinRequest(name, userId) {
    return new Promise((resolve, reject) => {
      const update = { $push: { joinRequests: userId } };
      this.findOneAndUpdate({ name }, update, { new: true }, (err, group) => {
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
  },

  removeAdmin(name, userId) {
    return new Promise((resolve, reject) => {
      this.findOne({ name }, (err, group) => {
        _.remove(group.admins, n => n.toString() === userId);
        group.markModified('admins');

        group.save((e, savedGroup) => {
          if (e) {
            reject(e);
          }
          resolve(savedGroup);
        });
      });
    });
  }
};

export default mongoose.model('Group', GroupSchema);
