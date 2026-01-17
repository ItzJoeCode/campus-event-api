import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  venue: string;
  organizer: mongoose.Types.ObjectId;
  totalTickets: number;
  availableTickets: number;
  price: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'cancelled' | 'completed';
}

const EventSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 1
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0,
    default: function() {
      return (this as any).totalTickets;
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'cancelled', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;