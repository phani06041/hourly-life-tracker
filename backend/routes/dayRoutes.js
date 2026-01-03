import express from "express";
import DayEntry from "../models/DayEntry.js";

const router = express.Router();

/**
 * GET day by date
 * /api/day/2026-01-03
 */
router.get("/:date", async (req, res) => {
  try {
    const day = await DayEntry.findOne({ date: req.params.date });
    res.json(day); // can be null – frontend handles it
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CREATE or UPDATE day
 */
router.post("/", async (req, res) => {
  try {
    const { date, hours, spent, weight, comment } = req.body;

    const day = await DayEntry.findOneAndUpdate(
      { date },
      { hours, spent, weight, comment },
      { upsert: true, new: true }
    );

    res.json(day);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
