import express from "express";
import DayEntry from "../models/DayEntry.js";

const router = express.Router();

/* ======================================================
   HELPERS
   ====================================================== */

const sendCSV = (res, filename, headers, rows) => {
  const csv =
    headers.join(",") +
    "\n" +
    rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};
/* ======================================================
   DAILY TRACKER EXPORT (FIXED – COUNTS HOURS)
   ====================================================== */
/**
 * GET /api/export/daily
 * Query:
 *   type=daily | monthly | yearly | lifetime | range
 *   date=YYYY-MM-DD
 *   year=YYYY
 *   month=MM
 *   from=YYYY-MM-DD
 *   to=YYYY-MM-DD
 *   format=csv | json
 */
router.get("/daily", async (req, res) => {
  try {
    const {
      type = "daily",
      date,
      year,
      month,
      from,
      to,
      format = "csv"
    } = req.query;

    let filter = {};

    if (type === "daily" && date) {
      filter.date = date;
    }
    else if (type === "monthly" && year && month) {
      filter.date = { $regex: `^${year}-${month}` };
    }
    else if (type === "yearly" && year) {
      filter.date = { $regex: `^${year}-` };
    }
    else if (type === "range" && from && to) {
      filter.date = { $gte: from, $lte: to };
    }
    // lifetime → no filter

    const days = await DayEntry.find(filter).sort({ date: 1 });

    const ACTIVITY_LABELS = {
      1: "Sleep",
      2: "Travel",
      3: "Work",
      4: "Chores",
      5: "Exercise",
      6: "Leisure",
      7: "Misc"
    };

    const rows = days.map((d) => {
      // initialize counters
      const counts = {
        Sleep: 0,
        Travel: 0,
        Work: 0,
        Chores: 0,
        Exercise: 0,
        Leisure: 0,
        Misc: 0
      };

      // COUNT EACH HOUR
      Object.values(d.hours || {}).forEach((activityCode) => {
        if (!activityCode) return;
        const label = ACTIVITY_LABELS[activityCode];
        if (label) counts[label] += 1;
      });

      return {
        Date: d.date,
        Spent: d.spent || 0,
        Comment: d.comment || "",
        ...counts
      };
    });

    // JSON export
    if (format === "json") {
      return res.json(rows);
    }

    // CSV export
    sendCSV(
      res,
      "daily-tracker.csv",
      [
        "Date",
        "Spent",
        "Comment",
        "Sleep",
        "Travel",
        "Work",
        "Chores",
        "Exercise",
        "Leisure",
        "Misc"
      ],
      rows
    );
  } catch (err) {
    console.error("Daily export error:", err);
    res.status(500).json({ error: "Export failed" });
  }
});


/* ======================================================
   TIME ANALYTICS EXPORT
   ====================================================== */
router.get("/time", async (req, res) => {
  const { type, year, month, from, to, format = "csv" } = req.query;

  let filter = {};

  if (type === "monthly") filter.date = { $regex: `^${year}-${month}` };
  else if (type === "yearly") filter.date = { $regex: `^${year}-` };
  else if (type === "range") filter.date = { $gte: from, $lte: to };

  const days = await DayEntry.find(filter);

  const totals = {};
  days.forEach(d => {
    Object.values(d.hours || {}).forEach(code => {
      if (!code) return;
      totals[code] = (totals[code] || 0) + 1;
    });
  });

  const LABELS = {
    1: "Sleep", 2: "Travel", 3: "Work", 4: "Chores",
    5: "Exercise", 6: "Leisure", 7: "Misc / Prep"
  };

  const rows = Object.entries(totals).map(([code, hours]) => ({
    Activity: LABELS[code],
    Hours: hours
  }));

  if (format === "json") return res.json(rows);

  sendCSV(res, "time-analytics.csv", ["Activity", "Hours"], rows);
});

/* ======================================================
   SPEND EXPORT
   ====================================================== */
router.get("/spend", async (req, res) => {
  const { type, year, from, to, format = "csv" } = req.query;

  let filter = {};
  if (type === "range") filter.date = { $gte: from, $lte: to };
  else if (type !== "lifetime") filter.date = { $regex: `^${year}` };

  const days = await DayEntry.find(filter);

  const map = {};
  days.forEach(d => {
    if (!d.spent) return;
    const key = d.date.slice(0, 7);
    map[key] = (map[key] || 0) + d.spent;
  });

  const rows = Object.entries(map).map(([month, amount]) => ({
    Month: month,
    Amount: amount
  }));

  if (format === "json") return res.json(rows);

  sendCSV(res, "spend.csv", ["Month", "Amount"], rows);
});

/* ======================================================
   COMMENTS EXPORT
   ====================================================== */
router.get("/comments", async (req, res) => {
  const { type, year, month, from, to, format = "csv" } = req.query;

  let filter = {};
  if (type === "monthly") filter.date = { $regex: `^${year}-${month}` };
  else if (type === "yearly") filter.date = { $regex: `^${year}-` };
  else if (type === "range") filter.date = { $gte: from, $lte: to };

  const days = await DayEntry.find(filter);

  const rows = days
    .filter(d => d.comment)
    .map(d => ({
      Date: d.date,
      Comment: d.comment
    }));

  if (format === "json") return res.json(rows);

  sendCSV(res, "comments.csv", ["Date", "Comment"], rows);
});

export default router;
