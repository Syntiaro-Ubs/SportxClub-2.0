import { initDatabase, getPool } from "../server/db.js";

async function run() {
  await initDatabase();
  const pool = getPool();
  await pool.query("DELETE FROM reviews WHERE user_name = 'Sahil Athlete'");
  const [rows] = await pool.query("SELECT * FROM reviews");
  console.log("Current DB Reviews:", rows);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
