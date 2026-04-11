import express from "express";
import { getDistanceSetting, updateDistanceSetting } from "./settingsController.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { allowRoles } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// Anyone authenticated can view the distance setting
router.get("/distance", requireAuth, getDistanceSetting);

// Only admin can update the setting
router.put("/distance", requireAuth, allowRoles("admin"), updateDistanceSetting);

export default router;
