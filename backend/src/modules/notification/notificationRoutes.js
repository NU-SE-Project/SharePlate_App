import express from "express";
import { testNotification } from "./notificationController.js";

const router = express.Router();

router.post("/test", testNotification);

export default router;