import express from "express";
import DayEntry from "../models/DayEntry.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

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

const sendExcel = async (res, filename, rows) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Export");

  const headers = Object.keys(rows[0] || {});
  ws.columns = headers.map(h => ({
    header: h,
    key: h,
    width: 22
  }));

  ws.getRow(1).font = { bold: true };
  ws.autoFilter = {
    from: "A1",
    to: `${String.fromCharCode(64 + headers.length)}1`
  };

  rows.forEach(r => ws.addRow(r));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  await wb.xlsx.write(res);
  res.end();
};

const sendPDF = (res, filename, title, rows) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  if (!rows.length) {
    doc.fontSize(12).text("No data available.", { align: "center" });
    doc.end();
    return;
  }

  rows.forEach((row, i) => {
    doc.fontSize(13).font("Helvetica-Bold").text(`Record ${i + 1}`);
    doc.moveDown(0.3);

    Object.entries(row).forEach(([k, v]) => {
      doc.fontSize(11).font("Helvetica").text(`${k}: ${v ?? "-"}`);
    });

    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown();
  });

  doc.end();
};

/* ======================================================
   DAILY EXPORT (SAVED DATA ONLY)
   ====================================================== */

router.get("/daily", async (req, res) => {
  try {
    const { type="daily", date, year, month, from, to, format="csv" } = req.query;

    let filter = {};
    if (type === "daily" && date) filter.date = date;
    else if (type === "monthly" && year && month)
      filter.date = { $regex: `^${year}-${month}` };
    else if (type === "yearly" && year)
      filter.date = { $regex: `^${year}-` };
    else if (type === "range" && from && to)
      filter.date = { $gte: from, $lte: to };

    const days = await DayEntry.find(filter).sort({ date: 1 });

    const LABELS = {
      1: "Sleep", 2: "Travel", 3: "Work",
      4: "Chores", 5: "Exercise",
      6: "Leisure", 7: "Misc"
    };

    const rows = days.map(d => {
      const counts = {
        Sleep: 0, Travel: 0, Work: 0,
        Chores: 0, Exercise: 0,
        Leisure: 0, Misc: 0
      };

      Object.values(d.hours || {}).forEach(code => {
        const label = LABELS[code];
        if (label) counts[label]++;
      });

      return {
        Date: d.date,
        Spent: d.spent || 0,
        Comment: d.comment || "",
        ...counts
      };
    });

    if (format === "json") return res.json(rows);
    if (format === "xlsx") return sendExcel(res, "daily.xlsx", rows);
    if (format === "pdf")
      return sendPDF(res, "daily.pdf", "Daily Tracker (Saved Data)", rows);

    sendCSV(res, "daily.csv", Object.keys(rows[0] || {}), rows);
  } catch (err) {
    res.status(500).json({ error: "Daily export failed" });
  }
});




/* ======================================================
   TIME ANALYTICS EXPORT
   ====================================================== */

router.get("/time", async (req, res) => {
  try {
    const { type, year, month, from, to, format = "csv" } = req.query;

    let filter = {};
    if (type === "monthly" && year && month)
      filter.date = { $regex: `^${year}-${month}` };
    else if (type === "yearly" && year)
      filter.date = { $regex: `^${year}-` };
    else if (type === "range" && from && to)
      filter.date = { $gte: from, $lte: to };
    // lifetime → no filter

    const days = await DayEntry.find(filter);

    const totals = {};
    days.forEach(d => {
      Object.values(d.hours || {}).forEach(code => {
        if (!code) return;
        totals[code] = (totals[code] || 0) + 1;
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

    const rows = Object.entries(totals).map(([k, v]) => ({
      Activity: LABELS[k],
      Hours: v
    }));

    if (format === "json") return res.json(rows);
    if (format === "xlsx") return sendExcel(res, "time-analytics.xlsx", rows);
    if (format === "pdf")
      return sendPDF(res, "time-analytics.pdf", "Time Analytics", rows);

    sendCSV(res, "time-analytics.csv", ["Activity", "Hours"], rows);
  } catch (err) {
    console.error("Time export error:", err);
    res.status(500).json({ error: "Time export failed" });
  }
});

/* ======================================================
   SPEND EXPORT
   ====================================================== */

router.get("/spend", async (req, res) => {
  try {
    const { type, year, from, to, format = "csv" } = req.query;

    let filter = {};
    if (type === "range" && from && to)
      filter.date = { $gte: from, $lte: to };
    else if (type !== "lifetime" && year)
      filter.date = { $regex: `^${year}` };
    // lifetime → no filter

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
    if (format === "xlsx") return sendExcel(res, "spend.xlsx", rows);
    if (format === "pdf")
      return sendPDF(res, "spend.pdf", "Spend Tracker", rows);

    sendCSV(res, "spend.csv", ["Month", "Amount"], rows);
  } catch (err) {
    console.error("Spend export error:", err);
    res.status(500).json({ error: "Spend export failed" });
  }
});

/* ======================================================
   COMMENTS / HIGHLIGHTS EXPORT
   ====================================================== */

router.get("/comments", async (req, res) => {
  try {
    const { type, year, month, from, to, format = "csv" } = req.query;

    let filter = {};
    if (type === "monthly" && year && month)
      filter.date = { $regex: `^${year}-${month}` };
    else if (type === "yearly" && year)
      filter.date = { $regex: `^${year}-` };
    else if (type === "range" && from && to)
      filter.date = { $gte: from, $lte: to };
    // lifetime → no filter

    const days = await DayEntry.find(filter);

    const rows = days
      .filter(d => d.comment)
      .map(d => ({
        Date: d.date,
        Comment: d.comment
      }));

    if (format === "json") return res.json(rows);
    if (format === "xlsx") return sendExcel(res, "comments.xlsx", rows);
    if (format === "pdf")
      return sendPDF(res, "comments.pdf", "Comments & Highlights", rows);

    sendCSV(res, "comments.csv", ["Date", "Comment"], rows);
  } catch (err) {
    console.error("Comments export error:", err);
    res.status(500).json({ error: "Comments export failed" });
  }
});

export default router;
