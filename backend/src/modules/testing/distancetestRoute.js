import express from "express";
import { getNearbyTest } from "./distancetestcontroller.js";

const router = express.Router();

router.post("/nearby", getNearbyTest);

export default router;