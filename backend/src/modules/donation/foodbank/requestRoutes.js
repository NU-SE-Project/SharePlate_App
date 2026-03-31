import express from "express";
import { requestFood, approveRequest, rejectRequest, getAllRequests, getRequestsForRestaurant, getRequestsByDonation } from "./requestController.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js"; 
import { requireAuth } from "../../../middlewares/authMiddleware.js";

const router = express.Router();

// ── GET routes ─────────────────────────────────────────────────────────────
router.get("/restaurant/:restaurant_id", requireAuth, allowRoles("restaurant"), getRequestsForRestaurant);
router.get("/donation/:donationId",      requireAuth, allowRoles("restaurant"), getRequestsByDonation);
router.get("/:foodBank_id",              requireAuth, allowRoles("foodbank"),   getAllRequests);

// ── POST routes ────────────────────────────────────────────────────────────
router.post("/:food_id", requireAuth, allowRoles("foodbank"), requestFood);

// ── PUT routes — specific paths MUST come before wildcards ─────────────────
router.put("/approve/:request_id", requireAuth, allowRoles("restaurant"), approveRequest);
router.put("/reject/:request_id",  requireAuth, allowRoles("restaurant"), rejectRequest);

export default router;