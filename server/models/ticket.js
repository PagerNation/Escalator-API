import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  metadata: mongoose.Schema.Types.Mixed
});

export default mongoose.model('Ticket', TicketSchema);
