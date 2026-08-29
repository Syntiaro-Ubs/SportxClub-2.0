import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";
const DB_NAME = process.env.DB_NAME || "sportxclub";
const DB_PORT = process.env.DB_PORT || 3306;

let pool;

export async function initDatabase() {
  try {
    // 1. Connect without database to ensure DB exists
    const rootConn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await rootConn.end();

    // 2. Create pool for app
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log(`Connected to MySQL database: ${DB_NAME}`);

    // 3. Auto create tables
    await createTables();

    // 3.5. Ensure setup_data column exists in turf_owners
    try {
      await pool.query("ALTER TABLE turf_owners ADD COLUMN setup_data LONGTEXT");
    } catch (e) {
      // Column might already exist, ignore error
    }
    // 4. Auto seed initial demo data
    await seedData();

    return pool;
  } catch (error) {
    console.error("Database connection / initialization failed:", error.message);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error("Database pool not initialized!");
  }
  return pool;
}

async function createTables() {
  const conn = getPool();

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Player',
      phone VARCHAR(50),
      city VARCHAR(100),
      bio TEXT,
      selected_sports TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      games_played INT DEFAULT 0,
      bookings INT DEFAULT 0,
      joined_date VARCHAR(50),
      avatar LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS player_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_user_id INT NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS turf_owners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      owner_id VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      city VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Active',
      total_turfs INT DEFAULT 0,
      earnings VARCHAR(50) DEFAULT '₹0',
      joined_date VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS turf_owner_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      owner_profile_id INT NOT NULL UNIQUE,
      owner_id VARCHAR(50),
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS turfs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      sport_type VARCHAR(100),
      price_per_hour DECIMAL(10,2),
      rating DECIMAL(3,2) DEFAULT 4.5,
      status VARCHAR(50) DEFAULT 'Active',
      owner_name VARCHAR(255),
      owner_phone VARCHAR(50),
      image_url LONGTEXT,
      description LONGTEXT,
      amenities TEXT,
      rules TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_code VARCHAR(50),
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      user_phone VARCHAR(50),
      turf_name VARCHAR(255),
      turf_id INT,
      sport VARCHAR(100),
      date VARCHAR(50),
      time_slot VARCHAR(100),
      slot_time VARCHAR(100),
      amount DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'Confirmed',
      payment_method VARCHAR(50) DEFAULT 'UPI',
      payment_type VARCHAR(50) DEFAULT 'UPI',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS staff (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Receptionist',
      turf VARCHAR(255),
      turfs TEXT,
      is_active TINYINT(1) DEFAULT 1,
      permissions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      sport VARCHAR(100),
      location VARCHAR(255),
      date VARCHAR(50),
      time VARCHAR(50),
      players_joined INT DEFAULT 1,
      max_players INT DEFAULT 10,
      price_per_player DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'Upcoming',
      organizer VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_id VARCHAR(100),
      merchant_transaction_id VARCHAR(100),
      provider_reference_id VARCHAR(100),
      user_name VARCHAR(255),
      user_email VARCHAR(255),
      turf_name VARCHAR(255),
      amount DECIMAL(10,2),
      method VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Success',
      date VARCHAR(50),
      payment_details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS game_passes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      type VARCHAR(50),
      price DECIMAL(10,2),
      validity VARCHAR(50),
      discount VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE,
      discount VARCHAR(50),
      max_uses INT DEFAULT 100,
      used_count INT DEFAULT 0,
      expiry VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      subtitle VARCHAR(255),
      image_url TEXT,
      link VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Active',
      position INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(255),
      turf_name VARCHAR(255),
      rating INT DEFAULT 5,
      comment TEXT,
      status VARCHAR(50) DEFAULT 'Approved',
      date VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS player_wallets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      balance DECIMAL(10,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      label VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Success',
      is_credit TINYINT(1) DEFAULT 0,
      reference_key VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS player_matches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      booking_id INT,
      venue VARCHAR(255) NOT NULL,
      sport VARCHAR(100),
      match_date VARCHAR(50),
      result VARCHAR(50),
      score VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS player_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT NOT NULL,
      reviewer_id INT,
      rating INT DEFAULT 5,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS player_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      xp INT DEFAULT 0,
      is_top_scorer TINYINT(1) DEFAULT 0,
      is_team_captain TINYINT(1) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      category VARCHAR(100),
      reported_by VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Open',
      date VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255),
      message TEXT,
      target VARCHAR(100) DEFAULT 'All Users',
      status VARCHAR(50) DEFAULT 'Sent',
      sent_at VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS dashboard_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'Editor',
      status VARCHAR(50) DEFAULT 'Active',
      permissions TEXT,
      phone VARCHAR(50),
      avatar LONGTEXT,
      last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS admin_accounts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cms_user_id INT UNIQUE,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'Admin',
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      section_key VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      badge VARCHAR(100),
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      content_json LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle TEXT,
      image_url LONGTEXT NOT NULL,
      link VARCHAR(255),
      cta_text VARCHAR(100) DEFAULT 'Book Now',
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_sports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50) DEFAULT '⚽',
      image_url LONGTEXT,
      badge VARCHAR(100) DEFAULT 'Popular',
      description TEXT,
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      role VARCHAR(100) DEFAULT 'Verified Player',
      avatar LONGTEXT,
      rating INT DEFAULT 5,
      comment TEXT NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_facilities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT 'EQUIPMENT',
      image_url LONGTEXT NOT NULL,
      price DECIMAL(10, 2) DEFAULT 999.00,
      rating VARCHAR(50) DEFAULT '4.8',
      badge VARCHAR(100) DEFAULT 'PRO STORE',
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_offers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tag VARCHAR(100) DEFAULT 'Limited time',
      title VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      rating VARCHAR(50) DEFAULT '4.9',
      reviews INT DEFAULT 100,
      image_url LONGTEXT NOT NULL,
      className VARCHAR(100) DEFAULT 'md:col-span-1 md:row-span-1',
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_why_cards (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(100) DEFAULT 'ShieldCheck',
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      image_url LONGTEXT NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS cms_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_user_id INT,
      author VARCHAR(255) NOT NULL,
      author_avatar LONGTEXT,
      time VARCHAR(100) DEFAULT 'Just now',
      content TEXT NOT NULL,
      image_url LONGTEXT,
      likes INT DEFAULT 0,
      comments INT DEFAULT 0,
      shares INT DEFAULT 0,
      type VARCHAR(100) DEFAULT 'general',
      badge VARCHAR(100) DEFAULT 'Community',
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS community_post_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_post_like (post_id, user_id)
    )`,

    `CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      wallet_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      reference_key VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS tournaments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sport VARCHAR(100),
      location VARCHAR(255),
      start_date VARCHAR(100),
      teams INT DEFAULT 16,
      matches INT DEFAULT 24,
      prize VARCHAR(100) DEFAULT '₹50,000',
      status VARCHAR(50) DEFAULT 'Registration Open',
      organizer_name VARCHAR(255),
      organizer_email VARCHAR(255),
      image_url LONGTEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS tournament_teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tournament_id INT,
      tournament_name VARCHAR(255),
      team_name VARCHAR(255) NOT NULL,
      captain_name VARCHAR(255),
      captain_email VARCHAR(255),
      members_count INT DEFAULT 11,
      sport VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Pending',
      organizer_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS tournament_fixtures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      team1 VARCHAR(255) NOT NULL,
      team2 VARCHAR(255) NOT NULL,
      match_date VARCHAR(100),
      time VARCHAR(100),
      venue VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Upcoming',
      tournament_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS community_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      author_name VARCHAR(255) NOT NULL,
      author_avatar LONGTEXT,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS community_post_shares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      platform VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    await conn.query(sql);
  }

  // Handle Schema migrations/updates safely
  try {
    await conn.query("ALTER TABLE turf_owner_accounts ADD COLUMN owner_id VARCHAR(50)");
    console.log("Added owner_id column to turf_owner_accounts");
  } catch (e) {
    // Column already exists or table doesn't exist
  }

  // Run migrations for existing table columns
  try {
    await conn.query("ALTER TABLE turfs MODIFY COLUMN image_url LONGTEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN owner_email VARCHAR(255);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turf_owners ADD COLUMN owner_id VARCHAR(50) UNIQUE AFTER id;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN description LONGTEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN amenities TEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN rules TEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN display_order INT DEFAULT 0;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN all_display_order INT DEFAULT 0;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE turfs ADD COLUMN reviews INT DEFAULT 25;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE banners MODIFY COLUMN image_url LONGTEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE tournaments ADD COLUMN turf_name VARCHAR(255);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE tournaments ADD COLUMN turf_id INT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN sport VARCHAR(100);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE users ADD COLUMN bio TEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE users ADD COLUMN selected_sports TEXT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE users MODIFY COLUMN avatar LONGTEXT;");
  } catch (e) { }

  try {
    await conn.query("ALTER TABLE wallet_transactions ADD COLUMN reference_key VARCHAR(100) UNIQUE;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE cms_posts ADD COLUMN author_user_id INT;");
  } catch (e) { }

  try {
    await conn.query("ALTER TABLE payments ADD COLUMN merchant_transaction_id VARCHAR(100);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE payments ADD COLUMN provider_reference_id VARCHAR(100);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE payments ADD COLUMN user_email VARCHAR(255);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE payments ADD COLUMN turf_name VARCHAR(255);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE payments ADD COLUMN payment_details TEXT;");
  } catch (e) { }

  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN slot_time VARCHAR(100);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN time_slot VARCHAR(100);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN user_phone VARCHAR(50);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN turf_id INT;");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN sport VARCHAR(100);");
  } catch (e) { }
  try {
    await conn.query("ALTER TABLE bookings ADD COLUMN payment_type VARCHAR(50) DEFAULT 'UPI';");
  } catch (e) { }

  console.log("Database schema checked/created successfully.");
}

async function seedData() {
  const conn = getPool();

  // Check if admin user exists
  const [adminUsers] = await conn.query("SELECT * FROM users WHERE email = 'admin@sportxclub.com'");
  if (adminUsers.length === 0) {
    await conn.query(`
      INSERT INTO users (full_name, email, password, role, phone, city, status, games_played, bookings, joined_date, avatar)
      VALUES 
      ('System Admin', 'admin@sportxclub.com', 'admin123', 'admin', '+91 9999999999', 'Mumbai', 'Active', 0, 0, '2023-01-01', 'https://i.pravatar.cc/150?u=admin'),
      ('Rahul Sharma', 'rahul.s@example.com', 'user123', 'Player', '+91 9876543210', 'Mumbai', 'Active', 45, 12, '2023-01-15', 'https://i.pravatar.cc/150?u=1'),
      ('Priya Patel', 'priya.p@example.com', 'user123', 'Captain', '+91 8765432109', 'Delhi', 'Active', 120, 34, '2023-03-22', 'https://i.pravatar.cc/150?u=2'),
      ('Amit Kumar', 'amit.k@example.com', 'user123', 'Player', '+91 7654321098', 'Bangalore', 'Suspended', 15, 2, '2023-06-10', 'https://i.pravatar.cc/150?u=3'),
      ('Sneha Reddy', 'sneha.r@example.com', 'user123', 'Player', '+91 6543210987', 'Hyderabad', 'Active', 8, 1, '2023-08-05', 'https://i.pravatar.cc/150?u=4'),
      ('Vikram Singh', 'vikram.s@example.com', 'user123', 'Captain', '+91 5432109876', 'Pune', 'Active', 210, 85, '2022-11-20', 'https://i.pravatar.cc/150?u=5')
    `);
  }

  // Seed Staff if empty
  const [staff] = await conn.query("SELECT COUNT(*) as count FROM staff");
  if (staff[0].count === 0) {
    await conn.query(`
      INSERT INTO staff (first_name, last_name, email, phone, password, role, turf, is_active, permissions)
      VALUES 
      ('Rahul', 'Sharma', 'rahul@sportxclub.com', '+91 9876543210', 'password123', 'Manager', 'Cricket Ground 1', 1, '["dashboard","revenue","turfs","bookings","roles","events","reviews","promotions","report","settings"]'),
      ('Amit', 'Patel', 'amit@sportxclub.com', '+91 9123456789', 'password123', 'Maintenance', 'Premium Football Turf', 1, '["dashboard","turfs","calendar"]'),
      ('Sneha', 'Gupta', 'sneha@sportxclub.com', '+91 9988776655', 'password123', 'Receptionist', 'Cricket Ground 2', 1, '["dashboard","bookings","calendar","turfs"]')
    `);
  }

  // Seed Turf Owners if empty
  const [owners] = await conn.query("SELECT COUNT(*) as count FROM turf_owners");
  if (owners[0].count === 0) {
    await conn.query(`
      INSERT INTO turf_owners (name, email, phone, city, status, total_turfs, earnings, joined_date)
      VALUES 
      ('Rajesh Mehta', 'rajesh.m@example.com', '+91 9820012345', 'Mumbai', 'Active', 3, '₹1.2L', '2023-02-10'),
      ('Sunil Gavaskar', 'sunil.g@example.com', '+91 9820054321', 'Mumbai', 'Active', 2, '₹85K', '2023-04-15'),
      ('Anil Kumble', 'anil.k@example.com', '+91 9845012345', 'Bangalore', 'Pending Approval', 1, '₹0', '2023-09-01'),
      ('Rohan Bopanna', 'rohan.b@example.com', '+91 9845054321', 'Bangalore', 'Active', 4, '₹2.4L', '2022-12-05')
    `);
  }

  // Seed Turfs if empty
  const [turfs] = await conn.query("SELECT COUNT(*) as count FROM turfs");
  if (turfs[0].count === 0) {
    await conn.query(`
      INSERT INTO turfs (name, location, sport_type, price_per_hour, rating, status, owner_name, owner_phone, image_url)
      VALUES 
      ('Green Turf Arena', 'Andheri West, Mumbai', 'Football, Cricket', 1500.00, 4.8, 'Active', 'Rajesh Mehta', '+91 9820012345', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600'),
      ('Urban Sports Hub', 'Koramangala, Bangalore', 'Box Cricket, Badminton', 1200.00, 4.6, 'Active', 'Rohan Bopanna', '+91 9845054321', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'),
      ('Champions Turf', 'Gachibowli, Hyderabad', 'Football', 1800.00, 4.9, 'Active', 'Sunil Gavaskar', '+91 9820054321', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600'),
      ('Apex Sports Complex', 'Connaught Place, Delhi', 'Multi-sport', 2000.00, 4.3, 'Under Maintenance', 'Anil Kumble', '+91 9845012345', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600')
    `);
  }

  // Seed Bookings if empty
  const [bookings] = await conn.query("SELECT COUNT(*) as count FROM bookings");
  if (bookings[0].count === 0) {
    await conn.query(`
      INSERT INTO bookings (booking_code, user_name, user_email, turf_name, date, time_slot, amount, status, payment_method)
      VALUES 
      ('BK-9821', 'Rahul Sharma', 'rahul.s@example.com', 'Green Turf Arena', '2026-08-05', '06:00 PM - 07:00 PM', 1500.00, 'Confirmed', 'UPI'),
      ('BK-9822', 'Priya Patel', 'priya.p@example.com', 'Urban Sports Hub', '2026-08-05', '08:00 PM - 09:00 PM', 1200.00, 'Confirmed', 'Credit Card'),
      ('BK-9823', 'Vikram Singh', 'vikram.s@example.com', 'Champions Turf', '2026-08-06', '07:00 PM - 08:00 PM', 1800.00, 'Pending', 'Net Banking'),
      ('BK-9824', 'Sneha Reddy', 'sneha.r@example.com', 'Apex Sports Complex', '2026-08-07', '05:00 PM - 06:00 PM', 2000.00, 'Cancelled', 'UPI')
    `);
  }

  // Seed Games if empty
  const [games] = await conn.query("SELECT COUNT(*) as count FROM games");
  if (games[0].count === 0) {
    await conn.query(`
      INSERT INTO games (title, sport, location, date, time, players_joined, max_players, price_per_player, status, organizer)
      VALUES 
      ('Evening Football 7v7', 'Football', 'Green Turf Arena, Mumbai', '2026-08-05', '06:00 PM', 12, 14, 250.00, 'Open', 'Rahul Sharma'),
      ('Weekend Box Cricket', 'Cricket', 'Urban Sports Hub, Bangalore', '2026-08-08', '09:00 AM', 10, 12, 200.00, 'Open', 'Priya Patel'),
      ('Late Night Badminton', 'Badminton', 'Apex Sports Complex, Delhi', '2026-08-06', '09:00 PM', 4, 4, 300.00, 'Full', 'Vikram Singh')
    `);
  }

  // Seed Payments if empty
  const [payments] = await conn.query("SELECT COUNT(*) as count FROM payments");
  if (payments[0].count === 0) {
    await conn.query(`
      INSERT INTO payments (transaction_id, user_name, amount, method, status, date)
      VALUES 
      ('TXN-881920', 'Rahul Sharma', 1500.00, 'UPI', 'Success', '2026-08-04'),
      ('TXN-881921', 'Priya Patel', 1200.00, 'Credit Card', 'Success', '2026-08-04'),
      ('TXN-881922', 'Vikram Singh', 1800.00, 'Net Banking', 'Pending', '2026-08-04'),
      ('TXN-881923', 'Sneha Reddy', 2000.00, 'UPI', 'Refunded', '2026-08-03')
    `);
  }

  // Seed Game Passes if empty
  const [passes] = await conn.query("SELECT COUNT(*) as count FROM game_passes");
  if (passes[0].count === 0) {
    await conn.query(`
      INSERT INTO game_passes (name, type, price, validity, discount, status)
      VALUES 
      ('Pro Monthly Pass', 'Monthly', 999.00, '30 Days', '20% OFF on all bookings', 'Active'),
      ('Weekend Warrior Pass', 'Weekly', 499.00, '7 Days', '15% OFF weekend slots', 'Active'),
      ('Annual VIP Club Pass', 'Yearly', 4999.00, '365 Days', '35% OFF + Priority slots', 'Active')
    `);
  }

  // Seed Coupons if empty
  const [coupons] = await conn.query("SELECT COUNT(*) as count FROM coupons");
  if (coupons[0].count === 0) {
    await conn.query(`
      INSERT INTO coupons (code, discount, max_uses, used_count, expiry, status)
      VALUES 
      ('WELCOME50', '50% OFF', 500, 142, '2026-12-31', 'Active'),
      ('SUMMER20', '20% OFF', 200, 89, '2026-09-30', 'Active'),
      ('MONSOON100', '₹100 OFF', 100, 100, '2026-08-01', 'Expired')
    `);
  }

  // Seed Banners if empty
  const [banners] = await conn.query("SELECT COUNT(*) as count FROM banners");
  if (banners[0].count === 0) {
    await conn.query(`
      INSERT INTO banners (title, subtitle, image_url, link, status, position)
      VALUES 
      ('Book Your Turf Now', 'Get flat 20% off on your first booking with coupon WELCOME50', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200', '/turfs', 'Active', 1),
      ('Join Local Squad Games', 'Meet players near you and play your favorite sports', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200', '/open-lobbies', 'Active', 2)
    `);
  }

  // Seed Reviews if empty
  const [reviews] = await conn.query("SELECT COUNT(*) as count FROM reviews");
  if (reviews[0].count === 0) {
    await conn.query(`
      INSERT INTO reviews (user_name, turf_name, rating, comment, status, date)
      VALUES 
      ('Rahul Sharma', 'Green Turf Arena', 5, 'Awesome turf quality, lighting was top notch!', 'Approved', '2026-08-01'),
      ('Priya Patel', 'Urban Sports Hub', 4, 'Great location and well maintained amenities.', 'Approved', '2026-08-02'),
      ('Amit Kumar', 'Champions Turf', 2, 'Parking issue during peak weekend hours.', 'Pending', '2026-08-03')
    `);
  }

  // Seed Reports if empty
  const [reports] = await conn.query("SELECT COUNT(*) as count FROM reports");
  if (reports[0].count === 0) {
    await conn.query(`
      INSERT INTO reports (title, category, reported_by, priority, status, date)
      VALUES 
      ('Unresponsive Owner at Apex', 'Turf Issue', 'Rahul Sharma', 'High', 'Open', '2026-08-02'),
      ('Payment Refund Delayed', 'Payment', 'Sneha Reddy', 'Medium', 'In Progress', '2026-08-03'),
      ('Spam In Community Feed', 'Content', 'Priya Patel', 'Low', 'Resolved', '2026-08-01')
    `);
  }

  // Seed Notifications if empty
  const [notifications] = await conn.query("SELECT COUNT(*) as count FROM notifications");
  if (notifications[0].count === 0) {
    await conn.query(`
      INSERT INTO notifications (title, message, target, status, sent_at)
      VALUES 
      ('Weekend Tournament Special', 'Register your team for the Mumbai Football Championship!', 'All Users', 'Sent', '2026-08-03 10:00 AM'),
      ('System Maintenance', 'App maintenance scheduled for midnight 2 AM.', 'Turf Owners', 'Sent', '2026-08-02 04:00 PM')
    `);
  }

  // Seed Dashboard Console Users if empty
  const [dashUsers] = await conn.query("SELECT COUNT(*) as count FROM dashboard_users");
  if (dashUsers[0].count === 0) {
    const fullPermissions = JSON.stringify(["home-page", "turfs", "tournaments", "community", "team"]);
    const editorPermissions = JSON.stringify(["home-page", "community"]);
    const turfPermissions = JSON.stringify(["turfs", "home-page"]);

    await conn.query(`
      INSERT INTO dashboard_users (full_name, username, password, email, role, status, permissions, phone)
      VALUES 
      ('System Administrator', 'admin', 'admin123', 'cms@sportxclub.com', 'Super Admin', 'Active', ?, '+91 98765 43210'),
      ('Content Manager', 'editor', 'editor123', 'editor@sportxclub.com', 'Editor', 'Active', ?, '+91 98765 43211'),
      ('Turf Operations Lead', 'turfops', 'turf123', 'turfs@sportxclub.com', 'Turf Manager', 'Active', ?, '+91 98765 43212')
    `, [fullPermissions, editorPermissions, turfPermissions]);
  }

  // Seed CMS Admin User if empty
  const [cmsUsers] = await conn.query("SELECT COUNT(*) as count FROM cms_users");
  if (cmsUsers[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_users (username, password, email, role)
      VALUES ('admin', 'admin123', 'cms@sportxclub.com', 'Admin')
    `);
  }

  // Seed CMS Sections if empty
  const [cmsSections] = await conn.query("SELECT COUNT(*) as count FROM cms_sections");
  if (cmsSections[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_sections (section_key, title, subtitle, badge, is_active, display_order)
      VALUES 
      ('hero', 'Book Your Favorite Sports Turf in Seconds', 'Find, reserve, and play at premier turf venues across top cities with instant confirmation.', 'FIFA STANDARD TURFS', 1, 1),
      ('sports_categories', 'Explore Sports Categories', 'Pick your game and discover top-rated venues near you.', 'POPULAR SPORTS', 1, 2),
      ('featured_turfs', 'Top Featured Venues', 'Handpicked premier sports arenas with floodlights & pro amenities.', 'VERIFIED VENUES', 1, 3),
      ('why_choose_us', 'Why Play with SportXClub?', 'Built for players & turf owners with zero booking hassle.', 'WHY CHOOSE US', 1, 4),
      ('download_app', 'Get the SportXClub Mobile App', 'Instant slot booking, live tournament brackets & community lobbies in your pocket.', 'PLAY ANYTIME', 1, 5),
      ('faqs', 'Frequently Asked Questions', 'Got questions about booking, payments, or cancellations? We have answers.', 'HELP & FAQS', 1, 6)
    `);
  }

  // Seed CMS Sports if empty
  const [cmsSports] = await conn.query("SELECT COUNT(*) as count FROM cms_sports");
  if (cmsSports[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_sports (name, icon, image_url, badge, description, is_active, display_order)
      VALUES 
      ('Football', '⚽', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600', 'Popular', '5v5 & 7v7 Artificial Turf Arenas', 1, 1),
      ('Cricket', '🏏', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600', 'Top Rated', 'Net & Box Cricket Grounds', 1, 2),
      ('Badminton', '🏸', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', 'Indoor', 'Synthetic & Wooden Badminton Courts', 1, 3),
      ('Tennis', '🎾', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600', 'Pro Grass', 'Clay & Synthetic Hard Courts', 1, 4),
      ('Basketball', '🏀', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600', 'Trending', 'Full & Half Court Hardwood Surfaces', 1, 5)
    `);
  }

  // Seed CMS FAQs if empty
  const [cmsFaqs] = await conn.query("SELECT COUNT(*) as count FROM cms_faqs");
  if (cmsFaqs[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_faqs (question, answer, category, is_active, display_order)
      VALUES 
      ('How do I book a turf slot?', 'Simply select your sport, choose your preferred date and time slot, select payment method, and complete the booking in seconds.', 'Booking', 1, 1),
      ('What is the cancellation policy?', 'Full refund is processed if cancelled at least 2 hours prior to the booked slot start time.', 'Cancellation', 1, 2),
      ('Can I book a turf for recurring weekly games?', 'Yes, turf passes and recurring squad slot bookings are available under your user profile.', 'Passes', 1, 3)
    `);
  }

  // Seed CMS Facilities & Equipment if empty
  const [cmsFacilities] = await conn.query("SELECT COUNT(*) as count FROM cms_facilities");
  if (cmsFacilities[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_facilities (title, category, image_url, price, rating, badge, is_active, display_order)
      VALUES 
      ('Elite Series Pickleball Paddle', 'EQUIPMENT', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', 2499.00, '4.8', 'PRO STORE', 1, 1),
      ('Premium Leather Cricket Ball', 'ACCESSORIES', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600', 899.00, '4.7', 'PRO STORE', 1, 2),
      ('Anti-Slip Performance Grip Socks', 'APPAREL', 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600', 399.00, '4.9', 'PRO STORE', 1, 3),
      ('Carbon Fiber Pro Shin Guards', 'ACCESSORIES', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600', 1299.00, '4.8', 'PRO STORE', 1, 4),
      ('Pro Match Tennis Balls (Pack of 3)', 'ACCESSORIES', 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600', 649.00, '4.8', 'PRO STORE', 1, 5)
    `);
  }

  // Seed CMS Offers if empty
  const [cmsOffers] = await conn.query("SELECT COUNT(*) as count FROM cms_offers");
  if (cmsOffers[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_offers (tag, title, value, description, is_active, display_order)
      VALUES 
      ('Limited time', 'Early bird cashback', 'Flat 15% off', 'Use BOOKFIRST before 11 AM and save on select weekday slots.', 1, 1),
      ('Organizer offer', 'Tournament starter pack', 'Free listing', 'Launch your first event with verified venue discovery and bracket tools.', 1, 2),
      ('Trusted', 'Refund-safe booking', 'Easy cancellation', 'Clear refund rules, visible before payment, with trusted support.', 1, 3)
    `);
  }

  // Seed CMS Gallery if empty
  const [cmsGallery] = await conn.query("SELECT COUNT(*) as count FROM cms_gallery");
  if (cmsGallery[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_gallery (name, location, rating, reviews, image_url, className, is_active, display_order)
      VALUES 
      ('Elite Football Arena', 'Mumbai Central', '4.9', 124, 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800', 'md:col-span-2 md:row-span-2', 1, 1),
      ('Smash & Drive Badminton', 'Andheri West', '4.8', 89, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800', 'md:col-span-1 md:row-span-1', 1, 2),
      ('GreenPark Tennis Club', 'Bandra', '4.7', 56, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800', 'md:col-span-1 md:row-span-1', 1, 3),
      ('Hoops Rooftop Court', 'South Mumbai', '5.0', 210, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800', 'md:col-span-2 md:row-span-1', 1, 4)
    `);
  }

  // Seed CMS Why Cards if empty
  const [cmsWhy] = await conn.query("SELECT COUNT(*) as count FROM cms_why_cards");
  if (cmsWhy[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_why_cards (title, description, icon, is_active, display_order)
      VALUES 
      ('Verified Venues', 'Show only trusted venues with the right facilities, availability, and a booking experience players can rely on.', 'ShieldCheck', 1, 1),
      ('Secure Payments', 'Keep every transaction clear and safe with a checkout flow that feels serious and dependable.', 'CreditCard', 1, 2),
      ('Instant Booking', 'Convert interest into a confirmed slot quickly with a clean search, structured cards, and direct action.', 'Zap', 1, 3),
      ('24x7 Support', 'Help is available when players, venues, or organizers need it most, without making the UI feel noisy.', 'Headset', 1, 4)
    `);
  }

  // Seed CMS Events if empty
  const [cmsEvents] = await conn.query("SELECT COUNT(*) as count FROM cms_events");
  if (cmsEvents[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_events (title, date, location, image_url, is_active, display_order)
      VALUES 
      ('Weekend Turf League', '24 Jun - 26 Jun', 'Powai, Mumbai', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', 1, 1),
      ('City Cricket Cup', 'Sat, 25 Jun', 'Bandra, Mumbai', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600', 1, 2),
      ('Night Smash Open', 'Sun, 26 Jun', 'Navi Mumbai', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', 1, 3)
    `);
  }

  // Seed CMS Community Feed Posts if empty
  const [cmsPosts] = await conn.query("SELECT COUNT(*) as count FROM cms_posts");
  if (cmsPosts[0].count === 0) {
    await conn.query(`
      INSERT INTO cms_posts (author, time, content, image_url, likes, comments, shares, type, badge, is_active)
      VALUES 
      ('Rahul Sharma', '2 hours ago', 'Amazing match today! Our team won the Summer Cricket League finals. Special thanks to all teammates! 🏏🏆', 'https://images.unsplash.com/photo-1594470117722-de4b9a02ebed?w=1080', 156, 24, 8, 'match', 'Match Win', 1),
      ('Priya Patel', '5 hours ago', 'Looking for badminton players for a friendly match this Saturday at Champions Sports Complex. Who is in?', NULL, 42, 18, 3, 'event', 'Friendly Match', 1),
      ('Arjun Malhotra', '1 day ago', 'Just completed my 100th match on SportXClub! Thank you to this amazing community for making sports accessible to everyone! ⚽', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1080', 234, 45, 12, 'milestone', 'Milestone', 1),
      ('Sneha Reddy', '2 days ago', 'Tennis coaching session was absolutely amazing! Improved my backhand significantly. Highly recommend Ace Tennis Academy!', NULL, 89, 15, 5, 'review', 'Review', 1)
    `);
  }

  // Seed Tournament Fixtures if empty
  const [tFixtures] = await conn.query("SELECT COUNT(*) as count FROM tournament_fixtures");
  if (tFixtures[0].count === 0) {
    await conn.query(`
      INSERT INTO tournament_fixtures (team1, team2, match_date, time, venue, status)
      VALUES 
      ('Mumbai Warriors', 'Delhi Strikers', 'Jun 18, 2026', '6:00 PM', 'Elite Sports Arena', 'Upcoming'),
      ('Chennai Champions', 'Kolkata Knights', 'Jun 19, 2026', '7:00 PM', 'Champions Complex', 'Upcoming')
    `);
  }

  // Keep authentication identities in their own account tables. Existing profile
  // tables remain the source of domain data, while these tables are the only
  // tables used to authenticate each account type.
  await conn.query(`
    INSERT IGNORE INTO player_accounts (profile_user_id, full_name, email, password, status)
    SELECT id, full_name, email, password, COALESCE(status, 'Active')
    FROM users
    WHERE LOWER(COALESCE(role, 'player')) NOT IN ('admin', 'owner', 'turf owner', 'staff')
  `);

  await conn.query(`
    INSERT IGNORE INTO admin_accounts (cms_user_id, username, password, email, role, status)
    SELECT id, username, password, email, role, 'Active'
    FROM cms_users
  `);

  console.log("Database seeded successfully!");
}
