import express from "express";
import {
  createDonation,
  getAllDonations,
  getSingleDonation,
  updateDonation,
  deleteDonation,
} from "./donationController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, allowRoles("restaurant"), createDonation); // CREATE
router.get("/restaurant/:restaurant_id", requireAuth, allowRoles("restaurant"), getAllDonations); // READ ALL for a restaurant (uses restaurant/:restaurant_id)
router.get("/:id", requireAuth, allowRoles("restaurant"), getSingleDonation); // READ ONE
router.put("/:id", requireAuth, allowRoles("restaurant"), updateDonation); // UPDATE
router.delete("/:id", requireAuth, allowRoles("restaurant"), deleteDonation); // DELETE

export default router;
