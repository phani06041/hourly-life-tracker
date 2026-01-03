import express from "express";
import { spendAnalytics, hoursAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/spend", spendAnalytics);
router.get("/hours", hoursAnalytics);

export default router;
