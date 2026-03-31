import mongoose from "mongoose";
import Food from "../shop/Donation.js";
import Request from "./Request.js";
import User from "../../user/User.js";
import { sendSms } from "../../../services/notifyService.js";
import { getIO } from "../../../socket.js";


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


// Get all requests targeting a particular restaurant (requests made to restaurant donations)
export async function getRequestsByRestaurant({ restaurant_id }) {
    if (!restaurant_id || !mongoose.Types.ObjectId.isValid(restaurant_id)) {
        const err = new Error("Invalid or missing restaurant_id");
        err.statusCode = 400;
        throw err;
    }
    // Populate food and foodbank information for clarity
    const requests = await Request.find({ restaurant_id })
      .populate('food_id')
      .populate('foodBank_id', 'name address');
    return requests;
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

    // Emit real-time events: notify restaurant and update donation state
    try {
      const io = getIO();
      // Try to include friendly names for client display
      const foodbank = await User.findById(foodBank_id).select('name');
      const foodbankName = foodbank?.name || null;
      const itemName = food.foodName || null;
      if (io && request.restaurant_id) {
        io.to(request.restaurant_id.toString()).emit("new_food_request", {
          requestId: request._id,
          food_id,
          requestedQuantity: qty,
          foodName: food.foodName,
          foodBank_id,
          foodbankName,
          itemName,
        });
      }
      // Broadcast donation update so UIs can refresh
      if (io) {
        io.emit("donation_updated", {
          food_id,
          remainingQuantity: food.remainingQuantity,
        });
      }
    } catch (emitErr) {
      console.error("Socket emit failed for request creation:", emitErr);
    }
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

  const food = await Food.findById(request.food_id);
  if (!food) {
    const err = new Error("Food item not found");
    err.statusCode = 404;
    throw err;
  }

  if (food.remainingQuantity < request.requestedQuantity) {
    const err = new Error("Not enough remaining quantity to approve this request");
    err.statusCode = 400;
    throw err;
  }

  food.remainingQuantity -= request.requestedQuantity;
  if (food.remainingQuantity <= 0) {
    food.remainingQuantity = 0;
    food.status = "closed";
  }
  await food.save();

  request.status = "approved";
  request.approvedAt = new Date();
  await request.save();

  try {
    const io = getIO();
    if (io) {
      io.emit("request_accepted", {
        requestId: request._id,
        food_id: request.food_id,
        status: "approved"
      });
      io.emit("donation_updated", {
        food_id: request.food_id,
        remainingQuantity: food.remainingQuantity,
        status: food.status
      });
    }
  } catch (emitErr) {
    console.error("Socket emit failed for request approval:", emitErr);
  }

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

  request.status = "rejected";
  request.rejectedAt = new Date();
  await request.save();

  try {
    const io = getIO();
    if (io) {
      io.emit("request_rejected", {
        requestId: request._id,
        food_id: request.food_id,
        status: "rejected"
      });
    }
  } catch (emitErr) {
    console.error("Socket emit failed for request rejection:", emitErr);
  }

  return request;
}


// Get all requests for a specific donation
export async function getRequestsByDonation({ donationId }) {
  if (!donationId || !mongoose.Types.ObjectId.isValid(donationId)) {
    const err = new Error("Invalid or missing donationId");
    err.statusCode = 400;
    throw err;
  }

  const requests = await Request.find({ food_id: donationId })
    .populate('foodBank_id', 'name address')
    .populate('food_id');

  return requests;
}