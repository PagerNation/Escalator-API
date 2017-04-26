import mongoose from 'mongoose';
import httpStatus from 'http-status';
import _ from 'lodash';
import APIError from '../helpers/APIError';
import config from '../../config/env';

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
  metadata: {
    title: String,
    description: String
  },
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
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      device: mongoose.Schema.Types.Mixed
    }],
    default: []
  },
  isOpen: {
    type: Boolean,
    default: true,
    required: true
  },
  pageIds: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
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

  addAction(id, action, user, device) {
    const builtActionObject = {
      actionTaken: action,
      user,
      device,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const update = { $push: { actions: builtActionObject } };
      this.findByIdAndUpdate(id, update, { new: true }, (err, ticket) => {
        if (ticket) {
          return resolve(ticket);
        }
        reject(err);
      });
    });
  },

  removeAction(id, actionId) {
    const builtActionObject = {
      _id: actionId
    };

    return new Promise((resolve, reject) => {
      const update = { $pull: { actions: builtActionObject } };
      this.findByIdAndUpdate(id, update, { new: true }, (err, ticket) => {
        if (ticket) {
          return resolve(ticket);
        }
        reject(err);
      });
    });
  },

  // I'm 100% sure there is a better way to do this
  // This gets the most recent ticket action and ticket information
  // for each group specified in <groups>. If there is no tickets
  // for a given group it will not return a ticket
  getMostRecentTickets(groupNames) {
    const groups = _.concat([], groupNames);
    return new Promise((resolve, reject) => {
      this.aggregate(
        [
          { $match: {
            groupName: { $in: groups }
          } },
          { $unwind: '$actions' },
          { $sort: { groupName: 1, 'actions.timestamp': -1 } },
          { $group: {
            _id: '$groupName',
            timestamp: { $first: '$actions.timestamp' },
            user: { $first: '$actions.user' },
            actionTaken: { $first: '$actions.actionTaken' }
          } },
          { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } }
        ], (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
      );
    });
  },

  getTicketsByDate(filterOpts) {
    return new Promise((resolve, reject) => {
      const query = this.find();

      const limit = _.get(filterOpts, 'limit');
      if (!_.isNil(limit)) {
        query.limit(limit);
      } else {
        query.limit(config.defaultTicketQueryLimit);
      }

      const sortBy = _.get(filterOpts, 'sortBy');
      if (!_.isNil(sortBy)) {
        query.sort(`-${sortBy}`);
      } else {
        query.sort('-createdAt');
      }

      const isOpen = _.get(filterOpts, 'isOpen');
      if (!_.isNil(isOpen)) {
        query.where('isOpen').equals(isOpen);
      }

      const groupNames = _.get(filterOpts, 'groupNames');
      if (!_.isNil(groupNames)) {
        query.where('groupName').in([].concat(groupNames));
      }

      const to = _.get(filterOpts, 'to');
      if (!_.isNil(to)) {
        query.where('createdAt').lte(to);
      }

      const from = _.get(filterOpts, 'from');
      if (!_.isNil(from)) {
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
