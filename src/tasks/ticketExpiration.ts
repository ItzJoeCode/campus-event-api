import cron from 'node-cron';
import Ticket from '../models/Ticket';
import Event from '../models/Event';
import fetch from 'node-fetch';

/**
 * Task to expire unpaid tickets that are past their expiration time
 * Runs every hour at minute 0
 */
export const expireUnpaidTickets = async (): Promise<void> => {
  console.log('⏰ Running ticket expiration check...');
  
  const now = new Date();
  
  try {
    // Find pending tickets that have expired
    const expiredTickets = await Ticket.find({
      status: 'pending',
      expiresAt: { $lt: now }
    });
    
    if (expiredTickets.length === 0) {
      console.log('✅ No tickets to expire');
      return;
    }
    
    console.log(`📊 Found ${expiredTickets.length} tickets to expire`);
    
    // Update tickets status to expired
    await Ticket.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: now }
      },
      {
        $set: { status: 'expired' }
      }
    );
    
    console.log(`✅ Expired ${expiredTickets.length} tickets`);
  } catch (error) {
    console.error('❌ Error expiring tickets:', error);
  }
};

export const keepServiceAlive = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    const BASE_URL = process.env.RENDER_EXTERNAL_URL || 'https://campus-event-api-izni.onrender.com';
    try {
      await fetch(`${BASE_URL}/health`);
      console.log('✅ Service pinged to prevent sleep');
    } catch (error) {
      console.log('⚠️ Ping failed');
    }
  }
};

/**
 * Initialize all cron jobs
 */
export const startCronJobs = (): void => {
  // Expire unpaid tickets every hour at minute 0
  cron.schedule('0 * * * *', expireUnpaidTickets);

  // Ping service every 10 minutes to keep alive
  cron.schedule('*/10 * * * *', keepServiceAlive);
  
  // Run immediately on startup
  expireUnpaidTickets();
  if (process.env.NODE_ENV === 'production') {
    keepServiceAlive();
  }
  
  console.log('🚀 Cron jobs initialized');
};