import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "sportxclub",
      port: process.env.DB_PORT || 3306,
    });

    const [rows] = await conn.query("SELECT id, owner_id, setup_data, status, created_at FROM turf_owners ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) {
      console.log("No turf owners found");
      return;
    }
    const latest = rows[0];
    
    let report = "--- STEP 1: MYSQL RECORD ---\n";
    report += `id: ${latest.id}\n`;
    report += `owner_id: ${latest.owner_id}\n`;
    report += `status: ${latest.status}\n`;
    report += `created_at: ${latest.created_at}\n\n`;

    const sd = latest.setup_data;
    report += `setup_data type: ${typeof sd}\n`;
    report += `setup_data is null?: ${sd === null}\n`;
    if (sd) {
      report += `setup_data length: ${sd.length}\n`;
      report += `first part of setup_data: ${sd.substring(0, 200)}\n`;
      try {
        const parsed1 = JSON.parse(sd);
        report += `\n--- STEP 2: JSON STRUCTURE ---\n`;
        report += `parsed level 1 type: ${typeof parsed1}\n`;
        
        let finalParsed = parsed1;
        if (typeof parsed1 === "string") {
            finalParsed = JSON.parse(parsed1);
            report += `parsed level 2 type: ${typeof finalParsed}\n`;
        }

        report += `top-level keys: ${Object.keys(finalParsed).join(", ")}\n`;
        if (finalParsed.business) {
            report += `Business keys: ${Object.keys(finalParsed.business).join(", ")}\n`;
            report += `Business Name: ${finalParsed.business.businessName}\n`;
        }
        if (finalParsed.turf) {
            report += `Turf Name: ${finalParsed.turf.name}\n`;
        }
        if (finalParsed.identity) {
            report += `Identity keys: ${Object.keys(finalParsed.identity).join(", ")}\n`;
            report += `Aadhaar Front null?: ${finalParsed.identity.aadhaarFront === null}\n`;
        }
      } catch (e) {
        report += `PARSE ERROR: ${e.message}\n`;
      }
    }

    report += `\n--- STEP 3: ADMIN API RESPONSE ---\n`;
    const res = await fetch("http://localhost:5000/api/admin/onboarding");
    const json = await res.json();
    if (!json.success) {
      report += `API returned success: false\n`;
    } else {
      const mapped = json.data.find(d => String(d.id) === String(latest.id));
      if (!mapped) {
        report += `Record not found in API response!\n`;
      } else {
        report += `Mapped keys: ${Object.keys(mapped).join(", ")}\n`;
        report += `Mapped business keys: ${Object.keys(mapped.business || {}).join(", ")}\n`;
        report += `Mapped businessName: ${mapped.business?.businessName}\n`;
        report += `Mapped turf name: ${mapped.turf?.name}\n`;
        report += `Mapped identity keys: ${Object.keys(mapped.identity || {}).join(", ")}\n`;
        report += `Mapped identity.aadhaarFront: ${mapped.identity?.aadhaarFront ? "exists" : "falsy"}\n`;
      }
    }

    fs.writeFileSync("diagnostics.txt", report);
    console.log("Diagnostics written to diagnostics.txt");
    await conn.end();
  } catch (e) {
    console.error(e);
  }
}

run();
