import { getPool, initDatabase } from './server/db.js';

async function updateTurfsAndReviews() {
  await initDatabase();
  const pool = getPool();

  await pool.query("UPDATE turfs SET reviews = 185 WHERE LOWER(name) LIKE '%shree%'");
  await pool.query("UPDATE turfs SET reviews = 156 WHERE LOWER(name) LIKE '%champions%'");
  await pool.query("UPDATE turfs SET reviews = 142 WHERE LOWER(name) LIKE '%green turf%'");
  await pool.query("UPDATE turfs SET reviews = 94 WHERE LOWER(name) = 'shri'");
  await pool.query("UPDATE turfs SET reviews = 82 WHERE LOWER(name) LIKE '%urban sports%'");
  await pool.query("UPDATE turfs SET reviews = 64 WHERE LOWER(name) LIKE '%apex sports%'");
  await pool.query("UPDATE turfs SET reviews = 38 WHERE LOWER(name) = 'test' AND id = 5");
  await pool.query("UPDATE turfs SET reviews = 18 WHERE LOWER(name) = 'test' AND id != 5");

  const [turfs] = await pool.query("SELECT id, name, rating, reviews, display_order, all_display_order FROM turfs ORDER BY reviews DESC, rating DESC");
  console.log("Turfs in DB after update:");
  console.table(turfs);

  process.exit(0);
}

updateTurfsAndReviews().catch(console.error);

