import express, { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

const router = express.Router();

// Base route handler
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🔐 Authentication API',
    version: '1.0.0',
    description: 'User registration and login endpoints',
    baseUrl: '/api/auth',
    endpoints: [
      {
        method: 'POST',
        path: '/register',
        description: 'Register a new user',
        auth: false,
        body: {
          name: { type: 'string', required: true, description: 'User full name' },
          email: { type: 'string', required: true, description: 'User email address' },
          password: { type: 'string', required: true, description: 'Password (min 6 chars)' },
          studentId: { type: 'string', required: false, description: 'Student ID (optional)' }
        },
        responses: {
          '201': { description: 'User created successfully', body: { success: true, token: 'JWT', user: 'User object' } },
          '400': { description: 'User already exists', body: { success: false, message: 'User already exists' } }
        }
      },
      {
        method: 'POST',
        path: '/login',
        description: 'Login existing user',
        auth: false,
        body: {
          email: { type: 'string', required: true, description: 'User email' },
          password: { type: 'string', required: true, description: 'User password' }
        },
        responses: {
          '200': { description: 'Login successful', body: { success: true, token: 'JWT', user: 'User object' } },
          '401': { description: 'Invalid credentials', body: { success: false, message: 'Invalid credentials' } }
        }
      }
    ],
    examples: {
      register: {
        curl: `curl -X POST https://campus-event-api-izni.onrender.com/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@campus.edu",
    "password": "password123",
    "studentId": "STU2024001"
  }'`
      },
      login: {
        curl: `curl -X POST https://campus-event-api-izni.onrender.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@campus.edu",
    "password": "password123"
  }'`
      }
    }
  });
});

// Register user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, studentId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      studentId
    });

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;