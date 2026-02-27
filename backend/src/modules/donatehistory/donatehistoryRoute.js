import { Router } from "express";
import { allowRoles } from "../../middlewares/roleMiddleware.js"; 
import { requireAuth } from "../../middlewares/authMiddleware.js";

import {
  getDonationHistory,
  getRequestHistory,
   getRestaurantDonationHistory,   // new
  getFoodbankRequestHistory,      
} from "../donatehistory/donatehistoryController.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Feature 1: Donation History
// Who donated food → who requested/received it → quantity → food name
// Admin sees all | Restaurant sees their own donations | Foodbank sees requests they made
router.get("/donations", allowRoles("admin", "restaurant", "foodbank"), getDonationHistory);

// Feature 2: Request History
// Foodbank food requests + which restaurants accepted them
// Admin sees all | Foodbank sees their own requests | Restaurant sees their acceptances
router.get("/requests", allowRoles("admin", "restaurant", "foodbank"), getRequestHistory);

// New — by specific ID (admin only, or the user themselves)
router.get("/donations/restaurant/:restaurantId", allowRoles("admin", "restaurant"), getRestaurantDonationHistory);
router.get("/requests/foodbank/:foodbankId", allowRoles("admin", "foodbank"), getFoodbankRequestHistory);

export default router;