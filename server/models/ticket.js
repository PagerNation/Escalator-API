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

  getTicketsByDate(filterOpts) {
    return new Promise((resolve, reject) => {
      const query = this.find()
        .limit(10)
        .sort('-createdAt');

      const isOpen = _.get(filterOpts, 'isOpen');
      if (!_.isNil(isOpen)) {
        query.where('isOpen').equals(isOpen);
      }

      const groupName = _.get(filterOpts, 'groupName');
      if (!_.isNil(groupName)) {
        query.where('groupName').equals(groupName);
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
