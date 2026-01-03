import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dayRoutes from "./routes/dayRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// 1️⃣ Create app FIRST
const app = express();

// 2️⃣ Middleware
app.use(cors());
app.use(express.json());

// 3️⃣ Health check (optional but useful)
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

// 4️⃣ Routes
app.use("/api/day", dayRoutes);
app.use("/api/analytics", analyticsRoutes);

// 5️⃣ MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/hourly_life_tracker")
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// 6️⃣ Start server LAST
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
