import express from "express";
import { acceptFoodRequest } from "./acceptanceController.js";


const router = express.Router();

router.post("/:donateId", acceptFoodRequest);

export default router;
