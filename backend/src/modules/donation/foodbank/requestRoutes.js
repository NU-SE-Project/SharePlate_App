import express from "express";
import { requestFood, approveRequest, rejectRequest, getAllRequests } from "./requestController.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js"; 
import { requireAuth } from "../../../middlewares/authMiddleware.js";


const router = express.Router();

// Route to get all requests of a food bank
router.get("/:foodBank_id", requireAuth, allowRoles("foodbank"), getAllRequests); 

// Route to request food
router.post("/:food_id", requireAuth, allowRoles("foodbank"), requestFood);

// accept/reject requested food donation
router.put("/approve/:request_id", requireAuth, allowRoles("restaurant"), approveRequest);
router.put("/reject/:request_id", requireAuth, allowRoles("restaurant"), rejectRequest);
 
export default router;
