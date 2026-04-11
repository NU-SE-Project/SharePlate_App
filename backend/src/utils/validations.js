import { z } from "zod";

export const nameSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Name is required"
        : "Name must be a text value",
  })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be at most 60 characters")
  .regex(
    /^[A-Za-z]+(?:[ .,'-][A-Za-z]+)*$/,
    "Name can contain only letters and basic punctuation",
  );

export const emailSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Email is required"
        : "Email must be a text value",
  })
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

export const passwordSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Password is required"
        : "Password must be a text value",
  })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])[^\s]{8,}$/,
    "Password must be at least 8 characters and include uppercase, lowercase, and a special character (no spaces)",
  );

export const addressSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Address is required"
        : "Address must be a text value",
  })
  .trim()
  .min(3, "Address must be at least 3 characters")
  .max(200, "Address must be at most 200 characters")
  .regex(
    /^[^,\s][^,]*?(?:\s*,\s*[^,\s][^,]*?)+$/,
    "Address must contain at least one comma and no empty segments (e.g., '123 Main St, Colombo')",
  );

export const contactNumberSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Contact number is required"
        : "Contact number must be a text value",
  })
  .trim()
  .regex(
    /^\+947[0-9]{8}$/,
    "Contact number must be in the format +947XXXXXXXX (e.g., +94771234567)",
  );

export const roleSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Role is required"
        : "Role must be a text value",
  })
  .refine((val) => ["restaurant", "foodbank", "admin"].includes(val), {
    message: "Role must be one of: restaurant, foodbank, admin",
  });

export const verificationStatusSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined
        ? "Verification status is required"
        : "Verification status must be a text value",
  })
  .refine(
    (val) => ["unverified", "pending", "verified", "rejected"].includes(val),
    {
      message:
        "Verification status must be one of: unverified, pending, verified, rejected",
    },
  );

export const verifiedAtSchema = z.union([
  z
    .string({
      error: "Verified at must be an ISO datetime string or null",
    })
    .datetime("Verified at must be a valid ISO datetime")
    .transform((value) => new Date(value)),
  z.null(),
]);

export const geoSchema = z
  .object(
    {
      type: z.literal("Point").optional().default("Point"),
      coordinates: z
        .array(
          z.number({
            error: "Coordinates must contain numbers",
          }),
          {
            error: (issue) =>
              issue.input === undefined
                ? "Coordinates are required"
                : "Coordinates must contain numbers",
          },
        )
        .length(2, "Coordinates must be [longitude, latitude]"),
    },
    {
      error: (issue) =>
        issue.input === undefined
          ? "Location is required"
          : "Location must be a valid object",
    },
  )
  .superRefine((val, ctx) => {
    // If coordinates exist, validate range
    const [lng, lat] = val.coordinates || [];

    if (typeof lng !== "number" || typeof lat !== "number") return;

    // longitude range
    if (lng < -180 || lng > 180) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coordinates", 0],
        message: "Longitude must be between -180 and 180",
      });
    }

    // latitude range
    if (lat < -90 || lat > 90) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coordinates", 1],
        message: "Latitude must be between -90 and 90",
      });
    }
  });

export default {
  nameSchema,
  emailSchema,
  passwordSchema,
  addressSchema,
  contactNumberSchema,
  roleSchema,
  verificationStatusSchema,
  verifiedAtSchema,
  geoSchema,
};
