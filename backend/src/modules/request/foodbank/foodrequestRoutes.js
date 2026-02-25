import express from "express";
import { createFoodRequest } from "./requestController.js";


const router = express.Router();

router.post("/", createFoodRequest);


export default router;
