const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server/routes/admin-routes.js');
let code = fs.readFileSync(filePath, 'utf8');

const replacement = `
      // 2. Turf Owner Queries
      const isOwnerFiltered = cleanEmail !== '' || cleanName !== '';

      if (entity === "turfs" || entity === "turf") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT * FROM turfs 
             WHERE (LOWER(owner_email) = ? AND ? != '') 
                OR (LOWER(owner_name) = ? AND ? != '')
             ORDER BY id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM turfs ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "bookings" || entity === "booking") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT b.* FROM bookings b
             INNER JOIN turfs t ON LOWER(t.name) = LOWER(b.turf_name)
             WHERE (LOWER(t.owner_email) = ? AND ? != '') 
                OR (LOWER(t.owner_name) = ? AND ? != '')
             ORDER BY b.id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM bookings ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "payments" || entity === "payment") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT p.* FROM payments p
             INNER JOIN turfs t ON LOWER(t.name) = LOWER(p.turf_name)
             WHERE (LOWER(t.owner_email) = ? AND ? != '') 
                OR (LOWER(t.owner_name) = ? AND ? != '')
             ORDER BY p.id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM payments ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "reviews" || entity === "review") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT r.* FROM reviews r
             INNER JOIN turfs t ON LOWER(t.name) = LOWER(r.turf_name)
             WHERE (LOWER(t.owner_email) = ? AND ? != '') 
                OR (LOWER(t.owner_name) = ? AND ? != '')
             ORDER BY r.id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM reviews ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }
      
      if (entity === "staff") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT s.* FROM staff s
             INNER JOIN turfs t ON LOWER(t.name) = LOWER(s.turf)
             WHERE (LOWER(t.owner_email) = ? AND ? != '') 
                OR (LOWER(t.owner_name) = ? AND ? != '')
             ORDER BY s.id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM staff ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "turf-owners" || entity === "owner" || entity === "owners") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT * FROM turf_owners 
             WHERE (LOWER(email) = ? AND ? != '') 
                OR (LOWER(name) = ? AND ? != '')
             ORDER BY id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM turf_owners ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "tournaments" || entity === "tournament") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT * FROM tournaments 
             WHERE (LOWER(organizer_email) = ? AND ? != '') 
                OR (LOWER(organizer_name) = ? AND ? != '')
             ORDER BY id DESC\`,
            [cleanEmail, cleanEmail, cleanName, cleanName]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM tournaments ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }

      if (entity === "tournament-teams") {
        if (isOwnerFiltered) {
          const [rows] = await pool.query(
            \`SELECT * FROM tournament_teams 
             WHERE (LOWER(organizer_email) = ? AND ? != '') 
             ORDER BY id DESC\`,
            [cleanEmail, cleanEmail]
          );
          return res.json({ success: true, data: rows });
        }
        const [allRows] = await pool.query("SELECT * FROM tournament_teams ORDER BY id DESC");
        return res.json({ success: true, data: allRows });
      }
`;

const regex = /\/\/ 2\. Turf Owner Queries[\s\S]*?(?=const \[rows\] = await pool.query\(`SELECT \* FROM \\`\$\{tableName\}\\` ORDER BY id DESC`\);)/;
if (regex.test(code)) {
    code = code.replace(regex, replacement.trim() + '\n    }\n\n    ');
    fs.writeFileSync(filePath, code);
    console.log("Success");
} else {
    console.log("Regex not found");
}
