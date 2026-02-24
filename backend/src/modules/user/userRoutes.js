import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { allowRoles } from "../../middlewares/roleMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { me, updateMe } from "./userController.js";

const router = Router();

const geoSchema = z.object({
  type: z.literal("Point").optional().default("Point"),
  coordinates: z
    .array(z.number())
    .length(2, "coordinates must be [longitude, latitude]"),
});

// Profile update validation
const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(3).optional(),
    contactNumber: z.string().min(7).optional(),
    location: geoSchema.optional(),
  }),
});

/**
 * ✅ Protected routes (any logged-in user)
 */
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, validate(updateMeSchema), updateMe);

export default router;
