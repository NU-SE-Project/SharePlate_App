import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../modules/user/User.js";

dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

function getRequiredEnv(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required for admin seeding`);
  }

  return value.trim();
}

function getCoordinateEnv(name, fallback) {
  const rawValue = process.env[name] ?? String(fallback);
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${name} must be a valid number`);
  }

  return parsedValue;
}

async function seedAdmin() {
  await connectDB();

  const adminName = getRequiredEnv("ADMIN_SEED_NAME", "System Admin");
  const adminEmail = getRequiredEnv("ADMIN_SEED_EMAIL", "admin@shareplate.com")
    .toLowerCase();
  const adminPassword = getRequiredEnv("ADMIN_SEED_PASSWORD", "Admin@123");
  const adminAddress = getRequiredEnv(
    "ADMIN_SEED_ADDRESS",
    "SharePlate HQ, Colombo",
  );
  const adminContactNumber = getRequiredEnv(
    "ADMIN_SEED_CONTACT_NUMBER",
    "+94770000000",
  );
  const longitude = getCoordinateEnv("ADMIN_SEED_LONGITUDE", 79.8612);
  const latitude = getCoordinateEnv("ADMIN_SEED_LATITUDE", 6.9271);

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  const update = {
    name: adminName,
    email: adminEmail,
    password: passwordHash,
    address: adminAddress,
    contactNumber: adminContactNumber,
    role: "admin",
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    isActive: true,
    emailVerified: true,
    verificationStatus: "verified",
    verifiedAt: new Date(),
    authProvider: "local",
  };

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create(update);
    console.log(`Created default admin: ${adminEmail}`);
    return;
  }

  existingAdmin.set(update);
  await existingAdmin.save();
  console.log(`Updated default admin: ${adminEmail}`);
}

seedAdmin()
  .catch((error) => {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
