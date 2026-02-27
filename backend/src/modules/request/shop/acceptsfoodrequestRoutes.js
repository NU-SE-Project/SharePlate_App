import express from "express";
import { acceptFoodRequest } from "./acceptanceController.js";
import { requireAuth } from "../../../middlewares/authMiddleware.js";
import { allowRoles } from "../../../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/:donateId",  requireAuth, allowRoles("restaurant"), acceptFoodRequest);

export default router;