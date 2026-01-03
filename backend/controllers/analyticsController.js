
import DayEntry from "../models/DayEntry.js";

export const hoursAnalytics = async (req, res) => {
  const { year } = req.query;
  const days = await DayEntry.find(year ? { date: { $regex: `^${year}` } } : {});

  const result = {};
  days.forEach(d => {
    Object.values(d.hours).forEach(code => {
      if (!code) return;
      result[code] = (result[code] || 0) + 1;
    });
  });

  res.json(result);
};

export const spendAnalytics = async (req, res) => {
  const { year } = req.query;
  const days = await DayEntry.find(year ? { date: { $regex: `^${year}` } } : {});

  const monthly = {};
  days.forEach(d => {
    const m = d.date.slice(0,7);
    monthly[m] = (monthly[m] || 0) + d.spent;
  });

  res.json(monthly);
};
