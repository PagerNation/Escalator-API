import mongoose from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';
import APIError from '../helpers/APIError';
import EscalationPolicy from './escalationPolicy';
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
  groups: [{
    type: String,
    ref: 'Group'
  }],
  devices: [Device.schema],
  delays: {
    type: [Number],
    default: []
  },
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

UserSchema.virtual('id').get(function () {
  return this._id.toString();
});

UserSchema.virtual('activeGroups', {
  ref: 'Group',
  localField: 'groups',
  foreignField: 'name'
});

UserSchema.methods = {
  getDevice(id) {
    return new Promise((resolve, reject) => {
      const foundDevice = _.find(this.devices, { id });

      if (foundDevice) {
        return resolve(foundDevice);
      }
      const error = new APIError(`Device with ID ${id} doesn\'t exist!`, httpStatus.NOT_FOUND);
      reject(error);
    });
  },

  addDevice(deviceModel, index) {
    this.devices.splice(index, 0, deviceModel);
    this.markModified('devices');

    return new Promise((resolve, reject) => {
      this.save((err, savedUser) => {
        if (err) {
          return reject(err);
        }
        resolve(savedUser);
      });
    });
  },

  updateDevice(id, updateInfo) {
    return new Promise((resolve, reject) => {
      let foundDevice = _.find(this.devices, { id });
      if (!foundDevice) {
        const error = new APIError(`Device with ID ${id} doesn\'t exist!`, httpStatus.NOT_FOUND);
        return reject(error);
      }

      foundDevice = _.extend(foundDevice, updateInfo);
      this.markModified('devices');

      this.save((err, savedUser) => {
        if (err) {
          return reject(err);
        }
        resolve(savedUser);
      });
    });
  },

  removeDevice(id) {
    _.remove(this.devices, { id });
    this.markModified('devices');

    return new Promise((resolve, reject) => {
      this.save((err, savedUser) => {
        if (err) {
          return reject(err);
        }
        resolve(savedUser);
      });
    });
  },

  sortDevices(orderList) {
    this.devices.sort((a, b) => orderList.indexOf(a.id) - orderList.indexOf(b.id));
    this.markModified('devices');

    return new Promise((resolve, reject) => {
      this.save((err, savedUser) => {
        if (err) {
          return reject(err);
        }
        resolve(savedUser);
      });
    });
  },

  addGroup(groupName) {
    this.groups.push(groupName);
    this.markModified('groups');

    return new Promise((resolve, reject) => {
      this.save((err, user) => {
        if (err) {
          reject(err);
        }
        resolve(user);
      });
    });
  },

  removeGroup(groupName) {
    _.remove(this.groups, { groupName });
    this.markModified('groups');

    return new Promise((resolve, reject) => {
      this.save((err, user) => {
        if (err) {
          reject(err);
        }
        resolve(user);
      });
    });
  },
};

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
          return resolve(user);
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
          return resolve();
        }
        const error = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  },

};

export default mongoose.model('User', UserSchema);
