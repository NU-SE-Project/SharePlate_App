import express from 'express';
import { getLandingOverview, getRestaurantDashboard } from './dashboardController.js';


import { allowRoles } from "../../middlewares/roleMiddleware.js"; 
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/landing', getLandingOverview);
router.get('/restaurant', requireAuth, allowRoles('restaurant'), getRestaurantDashboard);

export default router;
