import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { allowRoles } from "../../middlewares/roleMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import { me, updateMe, adminList, adminPatch } from "./userController.js";
import {
  nameSchema,
  emailSchema,
  passwordSchema,
  addressSchema,
  contactNumberSchema,
  roleSchema,
  geoSchema,
} from "../../utils/validations.js";

const router = Router();

// Profile update validation
const updateMeSchema = z.object({
  body: z.object({
    name: nameSchema,
    address: addressSchema,
    contactNumber: contactNumberSchema,
    location: geoSchema,
  }),
});

// Admin update validation
const adminPatchSchema = z.object({
  body: z.object({
    role: roleSchema,
    isActive: z.boolean().optional(),
    name: nameSchema,
    address: addressSchema,
    contactNumber: contactNumberSchema,
    location: geoSchema,
  }),
});

/**
 * ✅ Protected routes (any logged-in user)
 */
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, validate(updateMeSchema), updateMe);
router.get("/", requireAuth, allowRoles("admin"), adminList);
router.patch(
  "/:id",
  requireAuth,
  allowRoles("admin"),
  validate(adminPatchSchema),
  adminPatch,
);

export default router;
