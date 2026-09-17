import { getPool, initDatabase } from './server/db.js';

async function checkRecentPayments() {
  await initDatabase();
  const pool = getPool();
  
  const [payments] = await pool.query("SELECT * FROM payments ORDER BY id DESC LIMIT 5");
  console.log("Recent Payments in DB:", JSON.stringify(payments, null, 2));

  const [bookings] = await pool.query("SELECT * FROM bookings ORDER BY id DESC LIMIT 5");
  console.log("Recent Bookings in DB:", JSON.stringify(bookings, null, 2));
  process.exit(0);
}

checkRecentPayments().catch(console.error);
