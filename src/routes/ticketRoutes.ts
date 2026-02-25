import express, { Request, Response } from 'express';
import Event from '../models/Event';
import Ticket from '../models/Ticket';

const router = express.Router();

// Base route handler
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🎟️ Ticketing API',
    version: '1.0.0',
    description: 'Ticket purchase and management endpoints',
    baseUrl: '/api/tickets',
    endpoints: [
      {
        method: 'POST',
        path: '/purchase',
        description: 'Purchase a ticket for an event',
        auth: true,
        body: {
          eventId: { type: 'string', required: true, description: 'ID of the event' },
          userId: { type: 'string', required: true, description: 'ID of the user' }
        },
        responses: {
          '201': { description: 'Ticket reserved', body: { success: true, ticket: 'Ticket', expiresIn: '24 hours' } },
          '400': { description: 'No tickets available', body: { success: false, message: 'No tickets available' } },
          '404': { description: 'Event not found', body: { success: false, message: 'Event not found' } }
        }
      },
      {
        method: 'GET',
        path: '/user/:userId',
        description: 'Get all tickets for a user',
        auth: true,
        params: {
          userId: { type: 'string', required: true, description: 'User ID' }
        },
        responses: {
          '200': { description: 'List of user tickets', body: { success: true, count: 'number', data: 'Ticket[]' } }
        }
      }
    ],
    ticketStatus: {
      pending: 'Ticket reserved but not paid (expires in 24h)',
      confirmed: 'Ticket paid and confirmed',
      expired: 'Ticket not paid within 24h',
      used: 'Ticket checked in at event'
    },
    examples: {
      purchase: {
        curl: `curl -X POST https://campus-event-api-izni.onrender.com/api/tickets/purchase \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "eventId": "65a9f330e3b4c5d6e7f8a9b1",
    "userId": "65a9f1f2e3b4c5d6e7f8a9b0"
  }'`
      },
      getUserTickets: {
        curl: `curl https://campus-event-api-izni.onrender.com/api/tickets/user/65a9f1f2e3b4c5d6e7f8a9b0 \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`
      }
    }
  });
});

// Purchase ticket
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const { eventId, userId } = req.body;
    
    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check ticket availability
    if (event.availableTickets < 1) {
      return res.status(400).json({
        success: false,
        message: 'No tickets available'
      });
    }
    
    // Create ticket with price from event
    const ticket = await Ticket.create({
      event: eventId,
      user: userId,
      price: event.price,
      // status defaults to 'pending'
      // expiresAt defaults to 24 hours from now
      // ticketNumber auto-generates
    });
    
    // Update available tickets
    event.availableTickets -= 1;
    await event.save();
    
    res.status(201).json({
      success: true,
      message: 'Ticket reserved successfully',
      ticket,
      expiresIn: '24 hours'
    });
  } catch (error: any) {
    console.error('Ticket purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user tickets
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const tickets = await Ticket.find({ user: req.params.userId })
      .populate('event', 'title date venue')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;