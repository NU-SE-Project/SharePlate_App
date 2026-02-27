import { Router } from "express";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { allowRoles } from "../../middlewares/roleMiddleware.js";
import {
    createComplaint,
    getMyComplaints,
    getComplaintTargets,
    getAllComplaints,
    replyToComplaint,
} from "./complainController.js";

const router = Router();

/**
 * ✅ Routes for Restaurants and Foodbanks
 */
router.post(
    "/",
    requireAuth,
    allowRoles("restaurant", "foodbank"),
    createComplaint
);

router.get(
    "/my",
    requireAuth,
    allowRoles("restaurant", "foodbank"),
    getMyComplaints
);

router.get(
    "/targets",
    requireAuth,
    allowRoles("restaurant", "foodbank"),
    getComplaintTargets
);

/**
 * ✅ Routes for Admin
 */
router.get(
    "/",
    requireAuth,
    allowRoles("admin"),
    getAllComplaints
);

router.patch(
    "/:id/reply",
    requireAuth,
    allowRoles("admin"),
    replyToComplaint
);

export default router;
