import express from "express";
import { requestFood } from "../controllers/requestController.js";

const router = express.Router();

// Route to request food
router.post("/add", requestFood);

export default router;
