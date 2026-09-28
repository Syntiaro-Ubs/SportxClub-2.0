import { initDatabase, getPool } from "./server/db.js";
import { sendBookingEmails } from "./server/services/booking-email-service.js";

async function testEmail() {
  await initDatabase();
  console.log("DB Initialized");

  const testCode = `TEST_${Date.now()}`;
  const res = await sendBookingEmails(null, {
    bookingCode: testCode,
    userName: "Shri W",
    userEmail: "waghmareshrinivas99@gmail.com",
    userPhone: "9876543210",
    turfName: "Urban Sports Hub",
    sport: "Cricket",
    date: "2026-09-28",
    timeSlot: "12:00 PM – 01:00 PM",
    amount: 1,
    turfLocation: "Koramangala, Bangalore",
  });

  console.log("sendBookingEmails Result:", res);
  process.exit(0);
}

testEmail().catch(err => {
  console.error("Test Email Failed:", err);
  process.exit(1);
});
