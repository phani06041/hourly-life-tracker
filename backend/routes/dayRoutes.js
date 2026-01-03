import express from "express";
import { saveDay, getDay, getByMonth } from "../controllers/dayController.js";

const router = express.Router();

// MOST SPECIFIC FIRST
router.get("/date/:date", getDay);

// MONTH QUERY
router.get("/", getByMonth);

// SAVE (UPSERT)
router.post("/", saveDay);

export default router;
