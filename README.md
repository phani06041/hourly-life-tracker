# ⏱️ Hourly Life & Spend Tracker

A full-stack productivity and personal analytics application to **track daily activities hour-by-hour**, **monitor spending**, and **export clean reports** in CSV, Excel, and PDF formats.

---

## 🚀 Features

### 🗓 Daily Time Tracking
- 24-hour interactive grid
- Paint activities by hour
- Toggle 12-hour / 24-hour clock
- Categories:
  - Sleep
  - Travel
  - Work
  - Chores
  - Exercise
  - Leisure
  - Misc

### 💰 Spend & Notes
- Daily spend tracking
- Weight tracking
- Comments / highlights per day

### 📊 Analytics
- Daily time distribution (Doughnut chart)
- Monthly / yearly aggregation
- Time analytics breakdown

### 📤 Export System (Saved Data Only)
- CSV export
- Excel (.xlsx) export
- Print-quality PDF export
- Filters:
  - Daily
  - Monthly
  - Yearly
  - Custom date range
  - Lifetime

### 🛡 Data Safety (Important)
- Unsaved changes **never silently export**
- Warning shown before export if data isn’t saved
- All exports use **database-persisted data only**
- PDF generation happens **on the backend** (clean, consistent, printable)

---

## 🧱 Tech Stack

### Frontend
- React
- React Router
- Axios
- Chart.js
- HTML / CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- ExcelJS (Excel export)
- PDFKit (PDF export)

---

## 📂 Project Structure

```text
hourly-life-tracker/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ExportButton.jsx
│   │   ├── pages/
│   │   │   └── DayTracker.jsx
│   │   └── App.jsx
│   └── package.json
│
├── server/                 # Express backend
│   ├── models/
│   │   └── DayEntry.js
│   ├── routes/
│   │   └── exportRoutes.js
│   ├── server.js
│   └── package.json
│
├── README.md
└── requirements.txt        # Optional (informational)
