import DayEntry from "../models/DayEntry.js";

// ---------------- HOURS DONUT ----------------
export const hoursAnalytics = async (req, res) => {
  const { year, month } = req.query;

  let filter = {};
  if (year && month) filter.date = { $regex: `^${year}-${month}` };
  else if (year) filter.date = { $regex: `^${year}` };

  const days = await DayEntry.find(filter);

  const result = {};
  days.forEach(d => {
    Object.values(d.hours || {}).forEach(code => {
      if (!code) return;
      result[code] = (result[code] || 0) + 1;
    });
  });

  res.json(result);
};

// ---------------- SPEND BAR ----------------
export const spendAnalytics = async (req, res) => {
  const { year } = req.query;

  if (!year) return res.json({});

  const days = await DayEntry.find({
    date: { $regex: `^${year}` }
  });

  const monthlySpend = {};

  days.forEach(d => {
    const month = d.date.slice(0, 7); // YYYY-MM
    monthlySpend[month] = (monthlySpend[month] || 0) + (d.spent || 0);
  });

  res.json(monthlySpend);
};
