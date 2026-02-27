import mongoose from "mongoose";
import Food from "../shop/Donation.js";
import Request from "./Request.js";
import User from "../../user/User.js";
import { sendSms } from "../../../services/notifyService.js";


// Get all requests of a particular food bank
export async function getRequestsByFoodbank({ foodBank_id }) {
    if (!foodBank_id || !mongoose.Types.ObjectId.isValid(foodBank_id)) {
        const err = new Error("Invalid or missing foodBank_id");
        err.statusCode = 400;
        throw err;
    }
    const foodbankRequests = await Request.find({ foodBank_id });
    return foodbankRequests;
}


//Create a new food request
export async function createRequest({ food_id, restaurant_id, foodBank_id, requestedQuantity }) {
  // Validate ObjectId values
  if (!food_id || !mongoose.Types.ObjectId.isValid(food_id)) {
    const err = new Error("Invalid or missing food_id");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
    const err = new Error("Invalid restaurant_id");
    err.statusCode = 400;
    throw err;
  }
  if (!mongoose.Types.ObjectId.isValid(foodBank_id)) {
    const err = new Error("Invalid foodBank_id");
    err.statusCode = 400;
    throw err;
  }

  // Validate requestedQuantity
  const qty = Number(requestedQuantity);
  if (!Number.isInteger(qty) || qty < 1) {
    const err = new Error("requestedQuantity must be an integer >= 1");
    err.statusCode = 400;
    throw err;
  }

  // Find the food item
  const food = await Food.findById(food_id);
  if (!food) {
    const err = new Error("Food item not found");
    err.statusCode = 404;
    throw err;
  }

  // Check if requested quantity is valid
  if (qty > food.remainingQuantity) {
    const err = new Error("Requested quantity exceeds available food");
    err.statusCode = 400;
    throw err;
  }

  // Create request
  const request = new Request({
    food_id,
    restaurant_id,
    foodBank_id,
    requestedQuantity: qty,
    status: "pending",
  });
  await request.save();

  // Update food remaining quantity and close if depleted
  food.remainingQuantity -= qty;
  if (food.remainingQuantity <= 0) {
    food.remainingQuantity = 0;
    food.status = "closed";
  }
  await food.save();
    
  // Try to notify the restaurant via SMS if contactNumber exists.
  try {
    await sendRequestNotification(request);
  } catch (notifyErr) {
    console.error("Notification failed for request:", notifyErr);
  }

  return request;
}


export async function sendRequestNotification(request) {
  if (!request || !request.food_id) return;

  try {
    const food = await Food.findById(request.food_id);
    if (!food) return;

    const restaurantId =
      request.restaurant_id && mongoose.Types.ObjectId.isValid(request.restaurant_id)
        ? request.restaurant_id
        : food.restaurant_id;

    const restaurant = await User.findById(restaurantId).select("contactNumber name");
    if (!restaurant || !restaurant.contactNumber) return;

    const qty = Number(request.requestedQuantity) || 0;
    const msg = `Hello ${restaurant.name || "Restaurant"}, you have a new food request for ${food.foodName || "an item"}. Quantity: ${qty}.`;
    await sendSms(restaurant.contactNumber, msg);
  } catch (err) {
    console.error("Failed to send SMS notification:", err);
    throw err;
  }
}

export async function approveRequest(request_id) {
  if (!request_id || !mongoose.Types.ObjectId.isValid(request_id)) {
    const err = new Error("Invalid or missing request_id");
    err.statusCode = 400;
    throw err;
  }

  const request = await Request.findById(request_id);
  if (!request) {
    const err = new Error("Request not found");
    err.statusCode = 404;
    throw err;
  }

  if (request.status === "approved") {
    const err = new Error("Request already approved");
    err.statusCode = 400;
    throw err;
  }
  if (request.status === "rejected") {
    const err = new Error("Request already rejected");
    err.statusCode = 400;
    throw err;
  }

  request.status = "approved";
  request.approvedAt = new Date();
  await request.save();

  return request;
}

export async function rejectRequest(request_id) {
  if (!request_id || !mongoose.Types.ObjectId.isValid(request_id)) {
    const err = new Error("Invalid or missing request_id");
    err.statusCode = 400;
    throw err;
  }

  const request = await Request.findById(request_id);
  if (!request) {
    const err = new Error("Request not found");
    err.statusCode = 404;
    throw err;
  }

  if (request.status === "approved") {
    const err = new Error("Cannot reject an already approved request");
    err.statusCode = 400;
    throw err;
  }
  if (request.status === "rejected") {
    const err = new Error("Request already rejected");
    err.statusCode = 400;
    throw err;
  }

  // restore the food quantity reserved when request was created
  const food = await Food.findById(request.food_id);
  if (food) {
    const addQty = Number(request.requestedQuantity) || 0;
    food.remainingQuantity = (Number(food.remainingQuantity) || 0) + addQty;
    if (typeof food.totalQuantity === "number") {
      food.remainingQuantity = Math.min(
        food.remainingQuantity,
        food.totalQuantity,
      );
    }
    if (food.remainingQuantity > 0) {
      food.status = "available";
    }
    await food.save();
  }

  request.status = "rejected";
  request.rejectedAt = new Date();
  await request.save();

  return request;
}
