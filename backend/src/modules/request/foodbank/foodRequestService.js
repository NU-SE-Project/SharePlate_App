import mongoose from "mongoose";
import FoodRequest from "./FoodRequest.js";
import Acceptance from "../shop/Acceptance.js";

export async function createFoodRequestService({ foodbank_id, foodName, foodType, requestedQuantity }) {
  const qty = Number(requestedQuantity);

  if (!foodbank_id || !mongoose.Types.ObjectId.isValid(foodbank_id)) {
    const err = new Error("Invalid foodbank_id");
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    const err = new Error("Quantity must be greater than 0");
    err.statusCode = 400;
    throw err;
  }

  const request = await FoodRequest.create({
    foodbank_id,
    foodName, 
    foodType,
    requestedQuantity: qty,
    remainingQuantity: qty,
  });
 
  return { message: "Request created successfully", request };
}

export async function getRequestsByFoodbankService(foodbankId) {
  if (!mongoose.Types.ObjectId.isValid(foodbankId)) {
    const err = new Error("Invalid foodbank id");
    err.statusCode = 400;
    throw err;
  }

  const requests = await FoodRequest.find({ foodbank_id: foodbankId }).sort({ createdAt: -1 }).lean();
  
  // For each request, find its acceptances and populate restaurant info
  const requestsWithAcceptances = await Promise.all(requests.map(async (req) => {
    const acceptances = await Acceptance.find({ request_id: req._id })
      .populate("restaurant_id", "name email address phone")
      .populate("pickup_id", "otp status")
      .lean();
    return { ...req, acceptances };
  }));

  return { message: "Requests retrieved successfully", requests: requestsWithAcceptances };
}

export async function getAllOpenRequestsService() {
  // Return all requests (including fulfilled/closed) so frontend can display accepted/fulfilled entries
  const requests = await FoodRequest.find({})
    .populate("foodbank_id", "name email address")
    .sort({ createdAt: -1 })
    .lean();

  // Attach acceptances for each request to provide breakdown per restaurant
  const requestsWithAcceptances = await Promise.all(requests.map(async (req) => {
    const acceptances = await Acceptance.find({ request_id: req._id })
      .populate('restaurant_id', 'name address')
      .populate("pickup_id", "otp status")
      .lean();
    const acceptedTotal = acceptances.reduce((s, a) => s + (Number(a.acceptedQuantity) || 0), 0);
    return { ...req, acceptances, acceptedTotal };
  }));

  return { message: "Requests retrieved successfully", requests: requestsWithAcceptances };
}

export async function updateFoodRequestService(id, { foodName, foodType, requestedQuantity, status }) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid request id");
    err.statusCode = 400;
    throw err;
  }

  const request = await FoodRequest.findById(id);
  if (!request) {
    const err = new Error("Request not found");
    err.statusCode = 404;
    throw err;
  }

  if (requestedQuantity !== undefined) {
    const qty = Number(requestedQuantity);
    if (!Number.isInteger(qty) || qty < 0) {
      const err = new Error("requestedQuantity must be a non-negative integer");
      err.statusCode = 400;
      throw err;
    }

    const acceptedSoFar = request.requestedQuantity - request.remainingQuantity;
    if (qty < acceptedSoFar) {
      const err = new Error("requestedQuantity cannot be less than already accepted quantity");
      err.statusCode = 400;
      throw err;
    }

    request.requestedQuantity = qty;
    request.remainingQuantity = Math.max(0, qty - acceptedSoFar);
  }

  if (foodName !== undefined) request.foodName = foodName;
  if (foodType !== undefined) request.foodType = foodType;
  if (status !== undefined) request.status = status;

  await request.save();
  return { message: "Request updated successfully", request };
}

export async function deleteFoodRequestService(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid request id");
    err.statusCode = 400;
    throw err;
  }

  const request = await FoodRequest.findByIdAndDelete(id);
  if (!request) {
    const err = new Error("Request not found");
    err.statusCode = 404;
    throw err;
  }

  return request;
}
