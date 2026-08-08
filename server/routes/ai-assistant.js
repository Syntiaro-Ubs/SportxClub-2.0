import express from "express";
import { getPool } from "../db.js";

const router = express.Router();

const SPORT_TERMS = ["cricket", "football", "badminton", "tennis", "box cricket", "basketball", "volleyball"];
const LOCATION_TERMS = ["mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "pune", "navi mumbai", "andheri", "bandra", "powai"];

function getSport(message) {
  const normalized = message.toLowerCase();
  return SPORT_TERMS.find((sport) => normalized.includes(sport));
}

function getLocation(message, user) {
  const normalized = message.toLowerCase();
  const requestedLocation = LOCATION_TERMS.find((location) => normalized.includes(location));
  return requestedLocation || user?.city?.toLowerCase() || null;
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${amount.toLocaleString("en-IN")}` : "Price unavailable";
}

function dateLabel(value) {
  if (!value) return "Date to be announced";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function findUser(pool, { userId, email }) {
  if (userId !== undefined && userId !== null && String(userId).trim()) {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, city, selected_sports, games_played, bookings, bio FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    if (rows[0]) return rows[0];
  }

  if (email) {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, city, selected_sports, games_played, bookings, bio FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [email]
    );
    return rows[0] || null;
  }

  return null;
}

async function getVenues(pool, message, user) {
  const sport = getSport(message);
  const location = getLocation(message, user);
  const clauses = ["LOWER(status) = 'active'"];
  const params = [];

  if (sport) {
    clauses.push("LOWER(COALESCE(sport_type, '')) LIKE ?");
    params.push(`%${sport}%`);
  }
  if (location) {
    clauses.push("LOWER(COALESCE(location, '')) LIKE ?");
    params.push(`%${location}%`);
  }

  const [rows] = await pool.query(
    `SELECT id, name, location, sport_type, price_per_hour, rating, description, amenities
     FROM turfs
     WHERE ${clauses.join(" AND ")}
     ORDER BY rating DESC, price_per_hour ASC, id DESC
     LIMIT 5`,
    params
  );

  return { rows, sport, location };
}

async function getOpenGames(pool, message, user) {
  const sport = getSport(message);
  const location = getLocation(message, user);
  const clauses = ["LOWER(COALESCE(status, '')) IN ('open', 'upcoming')"];
  const params = [];

  if (sport) {
    clauses.push("LOWER(COALESCE(sport, '')) LIKE ?");
    params.push(`%${sport}%`);
  }
  if (location) {
    clauses.push("LOWER(COALESCE(location, '')) LIKE ?");
    params.push(`%${location}%`);
  }

  const [rows] = await pool.query(
    `SELECT id, title, sport, location, date, time, players_joined, max_players, price_per_player, status, organizer
     FROM games
     WHERE ${clauses.join(" AND ")}
     ORDER BY id DESC
     LIMIT 6`,
    params
  );

  return { rows, sport, location };
}

async function getEvents(pool) {
  const [rows] = await pool.query(
    "SELECT id, title, date, location FROM cms_events WHERE is_active = 1 ORDER BY display_order ASC, id ASC LIMIT 6"
  );
  return rows;
}

async function getPlayers(pool, message, user) {
  const sport = getSport(message);
  const location = getLocation(message, user);
  const clauses = ["LOWER(COALESCE(status, '')) = 'active'", "role NOT IN ('admin', 'owner')"];
  const params = [];

  if (user?.id) {
    clauses.push("id <> ?");
    params.push(user.id);
  }
  if (sport) {
    clauses.push("(LOWER(COALESCE(selected_sports, '')) LIKE ? OR LOWER(COALESCE(bio, '')) LIKE ?)");
    params.push(`%${sport}%`, `%${sport}%`);
  }
  if (location) {
    clauses.push("LOWER(COALESCE(city, '')) LIKE ?");
    params.push(`%${location}%`);
  }

  const [rows] = await pool.query(
    `SELECT id, full_name, city, role, selected_sports, games_played, bio
     FROM users
     WHERE ${clauses.join(" AND ")}
     ORDER BY games_played DESC, id DESC
     LIMIT 6`,
    params
  );

  return { rows, sport, location };
}

function venueAnswer(data) {
  const { rows, sport, location } = data;
  if (!rows.length) {
    return {
      content: `I checked the live venue database, but I could not find an active venue matching your search${sport ? ` for ${sport}` : ""}${location ? ` in ${location}` : ""}. Try another sport or city.`,
      suggestions: ["Show all active venues", "Find football venues in Mumbai", "Find badminton courts"],
      results: [],
    };
  }

  const lines = rows.map((venue, index) =>
    `${index + 1}. ${venue.name} — ${venue.location}\n   ${venue.sport_type || "Sports venue"} • ${venue.rating || "No"}/5 rating • ${money(venue.price_per_hour)}/hour`
  );
  return {
    content: `I found ${rows.length} active venue${rows.length === 1 ? "" : "s"} from the live database${location ? ` for ${location}` : ""}:\n\n${lines.join("\n\n")}\n\nYou can open a venue from the Turfs page to check its details and booking slots.`,
    suggestions: ["Show open games", "Find players near me", "Give me sports tips"],
    results: rows.map((venue) => ({ type: "venue", ...venue })),
  };
}

function gameAnswer(games, events) {
  if (!games.length && !events.length) {
    return {
      content: "I checked the live games and tournament database, but there are no open events to show right now.",
      suggestions: ["Find active venues", "Find players near me", "Give me sports tips"],
      results: [],
    };
  }

  const gameLines = games.map((game, index) =>
    `${index + 1}. ${game.title} — ${game.sport}\n   ${game.location} • ${dateLabel(game.date)} at ${game.time || "Time to be announced"}\n   ${game.players_joined || 0}/${game.max_players || "?"} players • ${money(game.price_per_player)} per player`
  );
  const eventLines = events.map((event, index) => `${index + 1}. ${event.title} — ${event.location}\n   ${event.date}`);
  const sections = [];
  if (gameLines.length) sections.push(`Open games:\n\n${gameLines.join("\n\n")}`);
  if (eventLines.length) sections.push(`Tournament events:\n\n${eventLines.join("\n\n")}`);

  return {
    content: `Here is the latest information from SportXClub's live events data:\n\n${sections.join("\n\n")}\n\nOpen the Games or Tournaments page to join or view more details.`,
    suggestions: ["Find football venues", "Find players for my sport", "Show my activity"],
    results: [
      ...games.map((game) => ({ type: "game", ...game })),
      ...events.map((event) => ({ type: "tournament", ...event })),
    ],
  };
}

function playerAnswer(data) {
  const { rows, sport, location } = data;
  if (!rows.length) {
    return {
      content: `I could not find active players${sport ? ` interested in ${sport}` : ""}${location ? ` near ${location}` : ""} in the live user database.`,
      suggestions: ["Find active venues", "Show open games", "Give me sports tips"],
      results: [],
    };
  }

  const lines = rows.map((player, index) =>
    `${index + 1}. ${player.full_name} — ${player.city || "Location not set"}\n   ${player.role || "Player"} • ${player.games_played || 0} games played${player.selected_sports ? ` • ${player.selected_sports}` : ""}`
  );
  return {
    content: `I found ${rows.length} active player${rows.length === 1 ? "" : "s"} in the live user database${location ? ` near ${location}` : ""}:\n\n${lines.join("\n\n")}\n\nUse Community to connect with players and arrange a match.`,
    suggestions: ["Find open games", "Find venues near me", "Show my activity"],
    results: rows.map((player) => ({ type: "player", ...player })),
  };
}

function profileAnswer(user) {
  if (!user) {
    return {
      content: "I can show your activity after you sign in. You can still ask me to find active venues, open games, tournament events, or players.",
      suggestions: ["Find active venues", "Show open games", "Find players near me"],
      results: [],
    };
  }

  return {
    content: `Here is the latest profile data for ${user.full_name}:\n\n• City: ${user.city || "Not set"}\n• Sports: ${user.selected_sports || "Not set"}\n• Games played: ${user.games_played || 0}\n• Bookings: ${user.bookings || 0}${user.bio ? `\n• Bio: ${user.bio}` : ""}`,
    suggestions: ["Find venues near me", "Find players for my sport", "Show open games"],
    results: [{ type: "profile", ...user }],
  };
}

async function overviewAnswer(pool) {
  const [[venueCount]] = await pool.query("SELECT COUNT(*) AS count FROM turfs WHERE LOWER(status) = 'active'");
  const [[gameCount]] = await pool.query("SELECT COUNT(*) AS count FROM games WHERE LOWER(status) IN ('open', 'upcoming')");
  const [[playerCount]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE LOWER(status) = 'active' AND role NOT IN ('admin', 'owner')");
  return {
    content: `I can answer using live SportXClub data. Right now the database has ${venueCount.count} active venues, ${gameCount.count} open games, and ${playerCount.count} active players. Ask me about a sport, city, venue, game, tournament, player match, or your profile activity.`,
    suggestions: ["Find cricket venues near me", "Show open games", "Find players for tennis doubles", "Show my activity"],
    results: [],
  };
}

router.post("/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ success: false, error: "Please enter a question." });
    if (message.length > 500) return res.status(400).json({ success: false, error: "Please keep your question under 500 characters." });

    const pool = getPool();
    const user = await findUser(pool, req.body || {});
    const normalized = message.toLowerCase();
    let answer;

    if (/\b(hello|hi|hey|what can you do|help)\b/.test(normalized)) {
      answer = await overviewAnswer(pool);
    } else if (/\b(my profile|my activity|my bookings|my games|how am i doing)\b/.test(normalized)) {
      answer = profileAnswer(user);
    } else if (/\b(player|players|teammate|team mate|partner|doubles|matchmaking|find people)\b/.test(normalized)) {
      answer = playerAnswer(await getPlayers(pool, message, user));
    } else if (/\b(tournament|tournaments|event|events|game|games|match|matches|join)\b/.test(normalized)) {
      const gameData = await getOpenGames(pool, message, user);
      answer = gameAnswer(gameData.rows, await getEvents(pool));
    } else if (/\b(tip|tips|improve|training|practice|coach|coaching)\b/.test(normalized)) {
      const sport = getSport(message) || getSport(user?.selected_sports || "");
      answer = {
        content: `${sport ? `${sport[0].toUpperCase()}${sport.slice(1)}` : "Sports"} tips: keep a consistent warm-up, track your match results in SportXClub, and choose a venue or open game that matches your level. I can also find live venues, games, and players for you.`,
        suggestions: ["Find venues near me", "Show open games", "Find players for my sport"],
        results: [],
      };
    } else if (/\b(venue|venues|turf|turfs|court|courts|ground|grounds|play|booking|book)\b/.test(normalized) || getSport(message)) {
      answer = venueAnswer(await getVenues(pool, message, user));
    } else {
      answer = await overviewAnswer(pool);
    }

    return res.json({
      success: true,
      data: {
        ...answer,
        user: user ? { id: user.id, name: user.full_name, city: user.city } : null,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return res.status(500).json({ success: false, error: "The assistant could not reach the live SportXClub data right now." });
  }
});

export default router;
