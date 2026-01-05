# ⏱️ Productivity Tracking Tool / Hourly Life & Spend Tracker

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
```
# ⚙️ Setup Instructions

1️⃣ **Clone the repository**
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

2️⃣ **Backend Setup**
```bash
cd server
npm install
```

Create a `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/hourly_tracker
PORT=5001
```

Run backend:
```bash
npm start
```

3️⃣ **Frontend Setup**
```bash
cd client
npm install
npm start
```

Frontend runs at:
```
http://localhost:3000
```

Backend runs at:
```
http://localhost:5001
```

---

# 📤 Export API Examples

### **Daily Export**
```http
GET /api/export/daily?type=daily&date=2026-01-03&format=pdf
```

### **Monthly Export**
```http
GET /api/export/daily?type=monthly&year=2026&month=01&format=xlsx
```

### **Range Export**
```http
GET /api/export/daily?type=range&from=2026-01-01&to=2026-01-31&format=csv
```

---

# 🖨 PDF Output
```
• Backend-generated
• Print-quality layout
• Proper margins, headings, and spacing
• No UI screenshot hacks
• Guaranteed saved data only
```

---

# 🔒 Data Integrity Guarantees
```
✔ Unsaved data never exports  
✔ Clear user warnings before export  
✔ Backend is the single source of truth  
✔ No accidental or silent data leakage
```

---

# 📌 Future Improvements (Optional)
```
• Authentication  
• Cloud sync  
• Mobile-friendly UI  
• Advanced analytics dashboards  
• Scheduled reports
```

---

# 👨‍💻 Author
```
Built with ❤️ to track life intentionally and improve daily habits.
```

---

# 📄 License
```
MIT License
```
