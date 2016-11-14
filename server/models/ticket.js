import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const TicketSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  metadata: mongoose.Schema.Types.Mixed
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
  }
};

export default mongoose.model('Ticket', TicketSchema);
