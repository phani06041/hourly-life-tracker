
import express from "express";
import { hoursAnalytics, spendAnalytics } from "../controllers/analyticsController.js";
const r = express.Router();

r.get("/hours", hoursAnalytics);
r.get("/spend", spendAnalytics);

export default r;
