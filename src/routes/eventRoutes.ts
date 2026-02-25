import express, { Request, Response } from 'express';
import Event from '../models/Event';

const router = express.Router();

// Get all events
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🎭 Events API',
    version: '1.0.0',
    description: 'Event management endpoints',
    baseUrl: '/api/events',
    endpoints: [
      {
        method: 'GET',
        path: '/',
        description: 'Get all events',
        auth: false,
        query: {
          category: { type: 'string', required: false, description: 'Filter by category' },
          status: { type: 'string', required: false, description: 'Filter by status' },
          page: { type: 'number', required: false, description: 'Page number' },
          limit: { type: 'number', required: false, description: 'Items per page' }
        },
        responses: {
          '200': { description: 'List of events', body: { success: true, count: 'number', data: 'Event[]' } }
        }
      },
      {
        method: 'GET',
        path: '/:id',
        description: 'Get single event by ID',
        auth: false,
        params: {
          id: { type: 'string', required: true, description: 'Event ID' }
        },
        responses: {
          '200': { description: 'Event details', body: { success: true, data: 'Event' } },
          '404': { description: 'Event not found', body: { success: false, message: 'Event not found' } }
        }
      },
      {
        method: 'POST',
        path: '/',
        description: 'Create a new event',
        auth: true,
        body: {
          title: { type: 'string', required: true, description: 'Event title' },
          description: { type: 'string', required: true, description: 'Event description' },
          date: { type: 'ISO string', required: true, description: 'Event date and time' },
          venue: { type: 'string', required: true, description: 'Event venue/location' },
          organizer: { type: 'string', required: true, description: 'User ID of organizer' },
          totalTickets: { type: 'number', required: true, description: 'Total number of tickets' },
          price: { type: 'number', required: true, description: 'Ticket price' },
          category: { type: 'string', required: true, description: 'Event category' }
        },
        responses: {
          '201': { description: 'Event created', body: { success: true, data: 'Event' } }
        }
      }
    ],
    categories: ['technical', 'cultural', 'sports', 'academic', 'social'],
    statuses: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    examples: {
      getAllEvents: {
        curl: `curl https://campus-event-api-izni.onrender.com/api/events?category=technical&limit=10`
      },
      createEvent: {
        curl: `curl -X POST https://campus-event-api-izni.onrender.com/api/events \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with workshops and speakers",
    "date": "2024-12-15T18:00:00.000Z",
    "venue": "Main Auditorium",
    "organizer": "65a9f1f2e3b4c5d6e7f8a9b0",
    "totalTickets": 500,
    "price": 150,
    "category": "technical"
  }'`
      }
    }
  });
});

// Get single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create event
router.post('/', async (req: Request, res: Response) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;