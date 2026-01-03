
import mongoose from "mongoose";

const hourSchema = {};
for (let i = 0; i < 24; i++) hourSchema[i] = { type: Number, default: 0 };

const dayEntrySchema = new mongoose.Schema({
  date: { type: String, unique: true },
  hours: hourSchema,
  spent: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  comment: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("DayEntry", dayEntrySchema);
