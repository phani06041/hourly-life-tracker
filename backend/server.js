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

// 3️⃣ Routes (AFTER app exists)
app.use("/api/day", dayRoutes);
app.use("/api/analytics", analyticsRoutes);

// 4️⃣ MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/hourly_life_tracker")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// 5️⃣ Start server LAST
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
