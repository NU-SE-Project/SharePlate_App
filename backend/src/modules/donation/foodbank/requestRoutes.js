import express from "express";
import { requestFood } from "./controllers/requestController.js";
import {
  approveRequest,
  rejectRequest,
} from "./controllers/approvalController.js";

const router = express.Router();

// Route to request food
router.post("/add/:food_id", requestFood);

// accept/reject requested food donation
router.put("/approve/:request_id", approveRequest);
router.put("/reject/:request_id", rejectRequest);

export default router;
