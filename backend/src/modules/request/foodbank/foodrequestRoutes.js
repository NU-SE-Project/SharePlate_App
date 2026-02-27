import express from "express";
import {
	createFoodRequest,
	getRequestDetails,
	getRequestsByFoodbank,
	updateFoodRequest,
	deleteFoodRequest,
} from "./requestController.js";

const router = express.Router();

router.post("/", createFoodRequest);
router.get("/foodbank/:foodbankId", getRequestsByFoodbank);
router.get("/:id", getRequestDetails);
router.put("/:id", updateFoodRequest);
router.delete("/:id", deleteFoodRequest);

export default router;
