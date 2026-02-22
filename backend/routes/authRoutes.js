import { Router } from "express";
import { z } from "zod"; // For request validation
import { validate } from "../middlewares/validateMiddleware.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { register, login, refresh } from "../controllers/authController.js";
import {
  nameSchema,
  emailSchema,
  passwordSchema,
  addressSchema,
  contactNumberSchema,
  roleSchema,
  geoSchema,
} from "../utils/validations.js";

const router = Router();

// ----------------------------
// Register body schema
// ----------------------------
const registerBodySchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    address: addressSchema,
    contactNumber: contactNumberSchema,
    role: roleSchema,
    location: geoSchema,
  })
  .superRefine((data, ctx) => {
    // Example: restaurants must have "address" with some detail (not just 'Sri Lanka')
    if (
      data.role === "restaurant || foodbank" &&
      data.address.toLowerCase() === "sri lanka"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message:
          "Please provide a more specific address (street/city) for restaurants",
      });
    }
  });

// ----------------------------
// Login body schema
// ----------------------------
const LoginBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .superRefine((data, ctx) => {
    // No extra fields allowed
    const allowedKeys = ["email", "password"];
    const extraKeys = Object.keys(data).filter(
      (key) => !allowedKeys.includes(key),
    );
    if (extraKeys.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: extraKeys,
        message: `Extra fields not allowed: ${extraKeys.join(", ")}`,
      });
    }
  });

// ----------------------------
// Final schema (matches your validate middleware shape)
// ----------------------------
export const registerSchema = z.object({
  body: registerBodySchema,
});
export const loginSchema = z.object({
  body: LoginBodySchema,
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
// ✅ Refresh token endpoint (cookie-based)
router.post("/refresh", refresh);

export default router;
