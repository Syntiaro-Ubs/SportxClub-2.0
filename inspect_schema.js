const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sportxclub'
  });
  
  try {
    const [rows] = await c.query('SHOW CREATE TABLE turf_onboarding_requests');
    console.log(rows[0]['Create Table']);
    
    const [desc] = await c.query('DESCRIBE turf_onboarding_requests');
    console.table(desc);
  } catch (err) {
    console.error(err);
  } finally {
    await c.end();
  }
}

run();
