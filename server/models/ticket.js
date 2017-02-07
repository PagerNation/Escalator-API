import mongoose from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';
import APIError from '../helpers/APIError';

const actionTypes = {
  CREATED: 'CREATED',
  PAGE_SENT: 'PAGE_SENT',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED'
};

const TicketSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  metadata: mongoose.Schema.Types.Mixed,
  actions: {
    type: [{
      actionTaken: {
        type: String,
        enum: [_.keys(actionTypes)],
        required: true
      },
      timestamp: {
        type: Number,
        required: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    default: []
  },
  isOpen: {
    type: Boolean,
    default: true,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now()
  }
});

TicketSchema.virtual('group', {
  ref: 'Group',
  localField: 'groupName',
  foreignField: 'name',
  justOne: true
});

TicketSchema.statics = {
  get(id) {
    return new Promise((resolve, reject) => {
      this.findById(id, (err, ticket) => {
        if (ticket) {
          return resolve(ticket);
        }
        const error = new APIError('No such ticket exists', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      this.findByIdAndRemove(id, (err, ticket) => {
        if (ticket) {
          return resolve();
        }
        const error = new APIError('No such ticket exists!', httpStatus.NOT_FOUND);
        reject(error);
      });
    });
  },

  addAction(id, action, userId) {
    const builtActionObject = {
      actionTaken: action,
      userId: userId,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      this.findByIdAndUpdate(id, { $push: { actions: builtActionObject } }, { new: true }, (err, ticket) => {
        if (ticket) {
          return resolve(ticket);
        }
        reject(err);
      });
    });
  },

  removeAction(id, action, timestamp, userId) {
    const builtActionObject = {
      actionTaken: action,
      userId: userId,
      timestamp: timestamp
    };

    return new Promise((resolve, reject) => {
      this.findByIdAndUpdate(id, { $pull: { actions: builtActionObject } }, { new: true }, (err, ticket) => {
        if (ticket) {
          return resolve(ticket);
        }
        reject(err);
      });
    });
  },

  getTicketsByDate(isOpen, groupName, to, from) {
    return new Promise((resolve, reject) => {
      const query = this.find()
        .limit(10)
        .sort('-createdAt');

        if (isOpen != undefined) {
          query.where('isOpen').equals(isOpen);
        }

        if (groupName) {
          query.where('groupName').equals(groupName);
        }

        if (to) {
          query.where('createdAt').lte(to);
        }

        if (from) {
          query.where('createdAt').gte(from);
        }

        query.exec((err, tickets) => {
          if (tickets) {
            return resolve(tickets);
          }
          reject(err);
        });
    });

  }
};

const model = mongoose.model('Ticket', TicketSchema);

export { model as default, actionTypes };
