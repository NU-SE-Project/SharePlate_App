import express from "express";
import {
	createFoodRequest,
	getRequestsByFoodbank,
	updateFoodRequest,
	deleteFoodRequest,
	getAllOpenRequests,
} from "./requestController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, allowRoles("foodbank"), createFoodRequest);
router.get("/", requireAuth, allowRoles("restaurant", "foodbank"), getAllOpenRequests);
router.get("/foodbank/:foodbankId", requireAuth, allowRoles("foodbank", "admin"), getRequestsByFoodbank);
router.put("/:id", requireAuth, allowRoles("foodbank"), updateFoodRequest);
router.delete("/:id", requireAuth, allowRoles("foodbank"), deleteFoodRequest);
 
export default router;