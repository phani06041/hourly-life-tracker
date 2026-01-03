
import DayEntry from "../models/DayEntry.js";

export const saveDay = async (req, res) => {
  console.log("🔥 SAVE DAY HIT");
  console.log("BODY:", req.body);

  const { date, hours, spent, weight, comment } = req.body;

  if (!date) {
    console.log("❌ DATE MISSING");
    return res.status(400).json({ error: "Date missing" });
  }

  const day = await DayEntry.findOneAndUpdate(
    { date },
    { date, hours, spent, weight, comment },
    { upsert: true, new: true }
  );

  console.log("✅ SAVED DOC:", day);
  res.json(day);
};



export const getDay = async (req, res) => {
  const day = await DayEntry.findOne({ date: req.params.date });
  res.json(day);
};

export const getByMonth = async (req, res) => {
  const { year, month } = req.query;
  const prefix = `${year}-${month}`;
  const days = await DayEntry.find({ date: { $regex: `^${prefix}` } });
  res.json(days);
};
