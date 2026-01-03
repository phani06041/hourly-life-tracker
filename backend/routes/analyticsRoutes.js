import express from "express";
import DayEntry from "../models/DayEntry.js";

const router = express.Router();

/* ======================================================
   TIME DISTRIBUTION (Daily / Monthly / Yearly)
   ====================================================== */

/**
 * GET /api/analytics/distribution
 * Query params:
 *   type=monthly | yearly
 *   year=2026
 *   month=01 (only for monthly)
 */
router.get("/distribution", async (req, res) => {
  try {
    const { type, year, month } = req.query;

    if (!year || !type) {
      return res.status(400).json({ error: "Missing params" });
    }

    let dateRegex = "";

    if (type === "monthly") {
      if (!month) {
        return res.status(400).json({ error: "Month required" });
      }
      dateRegex = `^${year}-${month}`; // YYYY-MM
    }

    if (type === "yearly") {
      dateRegex = `^${year}-`; // IMPORTANT dash
    }

    const days = await DayEntry.find({
      date: { $regex: dateRegex }
    });

    const totals = {};

    days.forEach((day) => {
      Object.values(day.hours || {}).forEach((activity) => {
        if (!activity) return;
        totals[activity] = (totals[activity] || 0) + 1;
      });
    });

    const LABELS = {
      1: "Sleep",
      2: "Travel",
      3: "Work",
      4: "Chores",
      5: "Exercise",
      6: "Leisure",
      7: "Misc / Prep"
    };

    const result = {};
    Object.entries(totals).forEach(([code, hours]) => {
      const label = LABELS[code];
      if (label) result[label] = hours;
    });

    res.json(result);
  } catch (err) {
    console.error("Distribution error:", err);
    res.status(500).json({});
  }
});

/* ======================================================
   SPEND ANALYTICS (FIXED FORMAT)
   ====================================================== */

/**
 * GET /api/analytics/spend
 * Query:
 *   year=2026
 *
 * RETURNS:
 * {
 *   "2026-01": 100,
 *   "2026-02": 0,
 *   ...
 * }
 */
router.get("/spend", async (req, res) => {
  try {
    const { year, type, from, to } = req.query;

    let filter = {};

    // ---------- FILTER LOGIC ----------
    if (type === "lifetime") {
      filter = {}; // no filter → all data
    }
    else if (type === "range") {
      if (!from || !to) {
        return res.status(400).json({ error: "from & to required" });
      }
      filter.date = { $gte: from, $lte: to };
    }
    else {
      // DEFAULT → yearly
      if (!year) {
        return res.status(400).json({ error: "Year required" });
      }
      filter.date = { $regex: `^${year}` };
    }

    const days = await DayEntry.find(filter);

    // ---------- MONTH INITIALIZATION ----------
    const monthlySpend = {};

    days.forEach((day) => {
      if (!day.spent) return;

      // YYYY-MM
      const monthKey = day.date.slice(0, 7);

      monthlySpend[monthKey] =
        (monthlySpend[monthKey] || 0) + day.spent;
    });

    res.json(monthlySpend);
  } catch (err) {
    console.error("Spend analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
