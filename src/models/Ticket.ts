import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  ticketNumber: string;
  price: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'used';
  expiresAt: Date;
  paymentId?: string;
  paymentMethod?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
}

const TicketSchema: Schema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true,
    default: function() {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(10000 + Math.random() * 90000);
      return `TICKET-${dateStr}-${random}`;
    }
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'expired', 'cancelled', 'used'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'wallet', 'cash', 'online'],
    default: 'online'
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TicketSchema.index({ status: 1 });
TicketSchema.index({ expiresAt: 1 });
TicketSchema.index({ user: 1, event: 1 });

const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
export default Ticket;