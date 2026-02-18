import express from "express";
import {
  createDonation,
  getAllDonations,
  getSingleDonation,
} from "../controllers/foodController.js";

const router = express.Router();

router.post("/", createDonation);          // CREATE
router.get("/", getAllDonations);          // READ ALL
router.get("/:id", getSingleDonation);     // READ ONE
// router.put("/:id", updateDonation);        // UPDATE
// router.delete("/:id", deleteDonation);     // DELETE

export default router;
