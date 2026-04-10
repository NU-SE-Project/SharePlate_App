import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middlewares/authMiddleware.js";
import { allowRoles } from "../../middlewares/roleMiddleware.js";
import { validate } from "../../middlewares/validateMiddleware.js";
import {
  me,
  updateMe,
  adminList,
  adminPatch,
  adminSoftDelete,
  // adminHardDelete,
} from "./userController.js";
import {
  nameSchema,
  addressSchema,
  contactNumberSchema,
  roleSchema,
  verificationStatusSchema,
  verifiedAtSchema,
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
    verificationStatus: verificationStatusSchema,
    verifiedAt: verifiedAtSchema,
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
router.patch("/me", requireAuth, validate(updateMeSchema), updateMe);
router.get("/", requireAuth, allowRoles("admin"), adminList);
router.patch(
  "/:id",
  requireAuth,
  allowRoles("admin"),
  validate(adminPatchSchema),
  adminPatch,
);

/**
 * 🛑 Delete routes (ADMIN ONLY)
 * DELETE /users/:id - Soft delete (recommended: deactivates account)
 * DELETE /users/:id?force=true - Hard delete (permanent: use with caution)
 */
router.delete("/:id", requireAuth, allowRoles("admin"), adminSoftDelete);

export default router;
