import express, { Request, Response } from 'express';
import Event from '../models/Event';

const router = express.Router();

// Get all events
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, limit, page } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    const itemsPerPage = limit ? parseInt(limit as string) : 100;
    const pageNumber = page ? parseInt(page as string) : 1;

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .limit(itemsPerPage)
      .skip((pageNumber - 1) * itemsPerPage);

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      count: events.length,
      total,
      data: events
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get documentation (moved to separate path to avoid conflict)
router.get('/docs', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🎭 Events API Documentation',
    endpoints: [
      {
        method: 'GET',
        path: '/',
        description: 'Get all events'
      }
    ]
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
