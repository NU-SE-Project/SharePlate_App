import express from "express";
import { getNearbyTest, getRouteDetailsController } from "./distancetestcontroller.js";

const router = express.Router();

router.post("/nearby", getNearbyTest);
router.post("/route-details", getRouteDetailsController);

export default router;