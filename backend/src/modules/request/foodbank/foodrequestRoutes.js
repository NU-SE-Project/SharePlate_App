import express from "express";
import {
	createFoodRequest,
	getRequestsByFoodbank,
	updateFoodRequest,
	deleteFoodRequest,
} from "./requestController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, allowRoles("foodbank"), createFoodRequest);
router.get("/foodbank/:foodbankId", requireAuth, allowRoles("foodbank"), getRequestsByFoodbank);
router.put("/:id", requireAuth, allowRoles("foodbank"), updateFoodRequest);
router.delete("/:id", requireAuth, allowRoles("foodbank"), deleteFoodRequest);
 
export default router; 
