import { z } from "zod";

export const nameSchema = z
  .string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a text value",
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
    required_error: "Email is required",
    invalid_type_error: "Email must be a text value",
  })
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

export const passwordSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a text value",
  })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9])[^\s]{8,}$/,
    "Password must be at least 8 characters and include uppercase, lowercase, and a special character (no spaces)",
  );

export const addressSchema = z
  .string({
    required_error: "Address is required",
    invalid_type_error: "Address must be a text value",
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
    required_error: "Contact number is required",
    invalid_type_error: "Contact number must be a text value",
  })
  .trim()
  .regex(
    /^\+947[0-9]{8}$/,
    "Contact number must be in the format +947XXXXXXXX (e.g., +94771234567)",
  );

export const roleSchema = z.enum(["restaurant", "foodbank", "admin"], {
  errorMap: () => ({
    message: "Role must be one of: restaurant, foodbank, admin",
  }),
});

export const geoSchema = z
  .object({
    type: z.literal("Point").optional().default("Point"),
    coordinates: z
      .array(
        z.number({
          required_error: "Coordinates must contain numbers",
          invalid_type_error: "Coordinates must contain numbers",
        }),
      )
      .length(2, "Coordinates must be [longitude, latitude]"),
  })
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
  geoSchema,
};
