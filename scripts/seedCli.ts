#!/usr/bin/env tsx
import { seedDatabase } from '../src/scripts/seedDatabase';

// run the seeding function and exit appropriately
(async () => {
  try {
    await seedDatabase();
    console.log('🎉 Database seeding completed via CLI');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
