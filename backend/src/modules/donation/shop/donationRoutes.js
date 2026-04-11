import express from "express";
import multer from 'multer';
import path from 'path';
import {
  createDonation,
  getAllDonations,
  getSingleDonation,
  updateDonation,
  deleteDonation,
} from "./donationController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js";

import { storage } from "../../../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/", requireAuth, allowRoles("restaurant"), upload.single('image'), createDonation); // CREATE
router.get("/", requireAuth, allowRoles("foodbank", "restaurant"), getAllDonations); // READ ALL (available to foodbanks)
router.get("/restaurant/:restaurant_id", requireAuth, allowRoles("restaurant", "admin"), getAllDonations); // READ ALL for a restaurant
router.get("/:id", requireAuth, allowRoles("restaurant", "foodbank"), getSingleDonation); // READ ONE
router.put("/:id", requireAuth, allowRoles("restaurant"), upload.single('image'), updateDonation); // UPDATE
router.delete("/:id", requireAuth, allowRoles("restaurant"), deleteDonation); // DELETE

export default router;
