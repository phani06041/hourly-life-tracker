import express from "express";
import DayEntry from "../models/DayEntry.js";

const router = express.Router();

/* SAVE / UPDATE DAY */
router.post("/", async (req, res) => {
  const { date, hours, spent, weight, comment } = req.body;

  const doc = await DayEntry.findOneAndUpdate(
    { date },
    { date, hours, spent, weight, comment },
    { upsert: true, new: true }
  );

  res.json(doc);
});

/* GET DAY BY DATE */
router.get("/:date", async (req, res) => {
  const day = await DayEntry.findOne({ date: req.params.date });
  res.json(day);
});

export default router;
