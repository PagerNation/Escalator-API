import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  metadata: mongoose.Schema.Types.Mixed
});


/**
 * Statics
 */
TicketSchema.statics = {

  /**
   * List all tickets.
   * @param {number} skip - Number of tickets to be skipped.
   * @param {number} limit - Limit number of tikets to be returned.
   * @returns {Promise<Ticket[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

export default mongoose.model('Ticket', TicketSchema);
