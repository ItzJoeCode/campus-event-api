import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../src/models/Event';
import User from '../src/models/User';
import Ticket from '../src/models/Ticket';

dotenv.config();

const sampleEvents = [
  {
    title: "Annual Tech Fest 2024",
    description: "Biggest tech festival of the year with workshops, hackathons, and guest speakers",
    organizer: new mongoose.Types.ObjectId(),
    date: new Date('2024-12-15T18:00:00.000Z'),
    venue: "Main Auditorium",
    totalTickets: 500,
    price: 150,
    category: "technical",
    status: "upcoming",
    availableTickets: 500
  },
  {
    title: "Campus Music Festival",
    description: "Live music performances from student bands and professional artists",
    organizer: new mongoose.Types.ObjectId(),
    date: new Date('2024-05-20T19:00:00.000Z'),
    venue: "University Stadium",
    totalTickets: 1000,
    price: 75,
    category: "cultural",
    status: "upcoming",
    availableTickets: 1000
  }
];

export const seedDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-event-api';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    console.log('🗑️ Cleared existing events');
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    await Ticket.deleteMany({});
    console.log('🗑️ Cleared existing tickets');

    // Insert sample events
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Added ${events.length} sample events`);

    // Create a sample user
    const user = await User.create({
      name: "Test User",
      email: "test@campus.edu",
      password: "password123",
      studentId: "STU2024001",
      role: "student"
    });
    console.log('✅ Created sample user');

    // Create a sample ticket
    const ticket = await Ticket.create({
      event: events[0]._id,
      user: user._id,
      price: events[0].price,
      status: "paid",
      ticketNumber: `TICKET-${Date.now()}-001`,
      paymentMethod: "online"
    });
    console.log('✅ Created sample ticket');

    console.log('\n🎉 Database seeding completed!');
    console.log('\nSample Data Created:');
    console.log('- Events:', events.map(e => e.title));
    console.log('- User:', user.email);
    console.log('- Ticket:', ticket.ticketNumber);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error; // propagate so caller can handle
  }
};
