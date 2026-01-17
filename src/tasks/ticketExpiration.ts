import cron from 'node-cron';
import Ticket from '../models/Ticket';
import Event from '../models/Event';

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

/**
 * Initialize all cron jobs
 */
export const startCronJobs = (): void => {
  // Expire unpaid tickets every hour at minute 0
  cron.schedule('0 * * * *', expireUnpaidTickets);
  
  // Run immediately on startup
  expireUnpaidTickets();
  
  console.log('🚀 Cron jobs initialized');
};