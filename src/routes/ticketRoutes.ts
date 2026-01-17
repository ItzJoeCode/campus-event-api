import express, { Request, Response } from 'express';
import Event from '../models/Event';
import Ticket from '../models/Ticket';

const router = express.Router();

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