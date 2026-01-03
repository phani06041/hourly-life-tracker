import express from "express";
import DayEntry from "../models/DayEntry.js";

const router = express.Router();

/**
 * GET monthly spend for a year
 * /api/analytics/spend?year=2026
 */
router.get("/spend", async (req, res) => {
  const year = req.query.year;

  if (!year) {
    return res.status(400).json({ error: "Year is required" });
  }

  const data = await DayEntry.aggregate([
    {
      $match: {
        date: { $regex: `^${year}` } // matches YYYY-MM-DD
      }
    },
    {
      $group: {
        _id: { $substr: ["$date", 0, 7] }, // YYYY-MM
        total: { $sum: "$spent" }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Convert to { "2026-01": 100, ... }
  const result = {};
  data.forEach((d) => {
    result[d._id] = d.total;
  });

  res.json(result);
});

export default router;
