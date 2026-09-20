import express from "express";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

app.get("/privacy.html", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "privacy.html")
  );
});

app.get("/terms.html", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "terms.html")
  );
});

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", async (req, res) => {
  try {
    const result = await sql`
      SELECT NOW() AS time
    `;

    res.json({
      ok: true,
      database: true,
      time: result[0].time
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      database: false
    });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const rows = await sql`
      SELECT
        id,
        title,
        category,
        start_date,
        end_date,
        color,
        favorite,
        created_at
      FROM events
      ORDER BY start_date ASC, id ASC
    `;

    const events = rows.map(row => ({
      id: Number(row.id),
      title: row.title,
      category: row.category,
      startDate: dateOnly(row.start_date),
      endDate: row.end_date ? dateOnly(row.end_date) : "",
      color: row.color,
      favorite: row.favorite
    }));

    res.json(events);

  } catch (error) {
    console.error("GET events error:", error);

    res.status(500).json({
      error: "Unable to load events."
    });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const {
      title,
      category,
      startDate,
      endDate,
      color
    } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({
        error: "Title and start date are required."
      });
    }

    if (endDate && endDate < startDate) {
      return res.status(400).json({
        error: "End date cannot be before start date."
      });
    }

    const result = await sql`
      INSERT INTO events (
        title,
        category,
        start_date,
        end_date,
        color
      )
      VALUES (
        ${title.trim()},
        ${category || "Personal"},
        ${startDate},
        ${endDate || null},
        ${color || "#7c5cff"}
      )
      RETURNING
        id,
        title,
        category,
        start_date,
        end_date,
        color,
        favorite
    `;

    res.status(201).json(
      normalizeEvent(result[0])
    );
  } catch (error) {
    console.error("POST event error:", error);

    res.status(500).json({
      error: "Unable to create event."
    });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      title,
      category,
      startDate,
      endDate,
      color
    } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({
        error: "Title and start date are required."
      });
    }

    const result = await sql`
      UPDATE events
      SET
        title = ${title.trim()},
        category = ${category || "Personal"},
        start_date = ${startDate},
        end_date = ${endDate || null},
        color = ${color || "#7c5cff"},
      WHERE id = ${id}
      RETURNING
        id,
        title,
        category,
        start_date,
        end_date,
        color,
        favorite
    `;

    if (!result.length) {
      return res.status(404).json({
        error: "Event not found."
      });
    }

    res.json(
      normalizeEvent(result[0])
    );
  } catch (error) {
    console.error("PUT event error:", error);

    res.status(500).json({
      error: "Unable to update event."
    });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await sql`
      DELETE FROM events
      WHERE id = ${id}
      RETURNING id
    `;

    if (!result.length) {
      return res.status(404).json({
        error: "Event not found."
      });
    }

    res.json({
      success: true
    });
  } catch (error) {
    console.error("DELETE event error:", error);

    res.status(500).json({
      error: "Unable to delete event."
    });
  }
});

function dateOnly(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return new Date(value)
    .toISOString()
    .slice(0, 10);
}

function normalizeEvent(row) {
  return {
    id: Number(row.id),
    title: row.title,
    category: row.category,
    startDate: dateOnly(row.start_date),
    endDate: row.end_date ? dateOnly(row.end_date) : "",
    color: row.color,
    favorite: row.favorite
  };
}

app.listen(PORT, () => {
  console.log(`Timeline running on port ${PORT}`);
});