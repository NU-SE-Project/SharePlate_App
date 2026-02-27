import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validateMiddleware.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
} from "./controllers/authController.js";
import {
  forgotPassword,
  resetPasswordHandler,
  changePasswordHandler,
  validateResetTokenHandler,
} from "./controllers/passwordController.js";
import {
  sendVerification,
  verifyEmailHandler,
  resendVerification,
} from "./controllers/emailVerificationController.js";

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

/* ----------------------------
   Validation Schemas
---------------------------- */

// Register schema (strict)
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
  .strict()
  .superRefine((data, ctx) => {
    // If address is too generic, reject for org roles
    const addr = String(data.address || "")
      .trim()
      .toLowerCase();
    if (
      (data.role === "restaurant" || data.role === "foodbank") &&
      (addr === "sri lanka" || addr.length < 6)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Please provide a more specific address (street/city).",
      });
    }
  });

const loginBodySchema = z
  .object({
    email: emailSchema,
    password: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Password is required"
            : "Password must be a text value",
      })
      .min(1, "Password is required"),
  })
  .strict();

const requestSchema = (bodySchema) =>
  z
    .object({
      body: bodySchema,
      params: z.any().optional(),
      query: z.any().optional(),
    })
    .strict();

const registerSchema = requestSchema(registerBodySchema);
const loginSchema = requestSchema(loginBodySchema);

const forgotPasswordSchema = requestSchema(
  z.object({ email: emailSchema }).strict(),
);

const resetPasswordSchema = requestSchema(
  z
    .object({
      token: z
        .string({
          error: (issue) =>
            issue.input === undefined
              ? "Token is required"
              : "Token must be a text value",
        })
        .min(1, "Token is required"),
      password: passwordSchema,
    })
    .strict(),
);

const changePasswordSchema = requestSchema(
  z
    .object({
      currentPassword: z
        .string({
          error: (issue) =>
            issue.input === undefined
              ? "Current password is required"
              : "Current password must be a text value",
        })
        .min(1, "Current password is required"),
      newPassword: passwordSchema,
    })
    .strict(),
);

const resendVerificationSchema = requestSchema(
  z.object({ email: emailSchema }).strict(),
);

/* ----------------------------
   Auth Routes
---------------------------- */
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);

/* ----------------------------
   Email Verification Routes
---------------------------- */
router.post("/send-verification", requireAuth, sendVerification);
router.get("/verify-email", verifyEmailHandler);
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  resendVerification,
);

/* ----------------------------
   Password Routes
---------------------------- */
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordHandler,
);
router.get("/validate-reset-token", validateResetTokenHandler);
router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  changePasswordHandler,
);

export default router;
