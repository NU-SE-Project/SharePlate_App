import Donation from "./Donation.js";
import mongoose from "mongoose";

export async function createDonationService(data) {
  const { 
    restaurant_id,
    foodName,
    description,
    foodType,
    totalQuantity,
    expiryTime,
    pickupWindowStart,
    pickupWindowEnd,
    imageUrl,
  } = data;

  if (
    !restaurant_id ||
    !foodName ||
    !totalQuantity ||
    !expiryTime ||
    !pickupWindowStart ||
    !pickupWindowEnd
  ) {
    const err = new Error("All required fields must be provided");
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
    const err = new Error("Invalid restaurant_id");
    err.statusCode = 400;
    throw err;
  }

  if (totalQuantity <= 0) {
    const err = new Error("Total quantity must be greater than 0");
    err.statusCode = 400;
    throw err;
  }

  const expiry = new Date(expiryTime);
  const start = new Date(pickupWindowStart);
  const end = new Date(pickupWindowEnd);

  if (end <= start) {
    const err = new Error("Pickup end time must be after start time");
    err.statusCode = 400;
    throw err;
  }

  if (expiry <= new Date()) {
    const err = new Error("Expiry time must be in the future");
    err.statusCode = 400;
    throw err;
  }

  if (end > expiry) {
    const err = new Error("Pickup window must end before expiry time");
    err.statusCode = 400;
    throw err;
  }

  const donation = await Donation.create({
    restaurant_id,
    foodName,
    description,
    foodType,
    totalQuantity,
    remainingQuantity: totalQuantity,
    expiryTime: expiry,
    pickupWindowStart: start,
    pickupWindowEnd: end,
    imageUrl,
  });

  return donation;
}

export async function getAllDonationsService(query) {
  const { status, foodType, restaurant_id } = query || {};
  let filter = {};
  if (status) filter.status = status;
  if (foodType) filter.foodType = foodType;
  if (restaurant_id) {
    if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
      const err = new Error("Invalid restaurant_id");
      err.statusCode = 400;
      throw err;
    }
    filter.restaurant_id = restaurant_id;
  }

  const donations = await Donation.find(filter).sort({ expiryTime: 1 });
  return donations;
}

export async function getSingleDonationService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid donation ID");
    err.statusCode = 400;
    throw err;
  }

  const donation = await Donation.findById(id);
  if (!donation) {
    const err = new Error("Donation not found");
    err.statusCode = 404;
    throw err;
  }

  return donation;
}

export async function updateDonationService(id, updates) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid donation ID");
    err.statusCode = 400;
    throw err;
  }

  if (updates.totalQuantity && updates.totalQuantity <= 0) {
    const err = new Error("Total quantity must be greater than 0");
    err.statusCode = 400;
    throw err;
  }

  const donation = await Donation.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!donation) {
    const err = new Error("Donation not found");
    err.statusCode = 404;
    throw err;
  }

  return donation;
}

export async function deleteDonationService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid donation ID");
    err.statusCode = 400;
    throw err;
  }

  const donation = await Donation.findByIdAndDelete(id);
  if (!donation) {
    const err = new Error("Donation not found");
    err.statusCode = 404;
    throw err;
  }

  return donation;
}
