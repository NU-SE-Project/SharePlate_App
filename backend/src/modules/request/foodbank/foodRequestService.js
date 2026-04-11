import mongoose from "mongoose";
import FoodRequest from "./FoodRequest.js";
import Acceptance from "../shop/Acceptance.js";
import User from "../../user/User.js";
import { sendSms } from "../../../services/notifyService.js";
import { getIO } from "../../../socket.js";
import { getMaxDistanceSetting } from "../../../services/distanceService.js";

function getCoordinates(location) {
  const coordinates = location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

  const [longitude, latitude] = coordinates.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return { latitude, longitude };
}

function calculateDistanceKm(origin, destination) {
  if (!origin || !destination) return null;

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) *
    Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

async function notifyNearbyRestaurantsForRequest(request) {
  const foodbank = await User.findById(request.foodbank_id)
    .select("name address location")
    .lean();

  const maxDistanceKm = await getMaxDistanceSetting();

  const foodbankCoordinates = getCoordinates(foodbank?.location);
  if (!foodbankCoordinates) {
    return {
      restaurantCount: 0,
      smsSentCount: 0,
      smsFailedCount: 0,
      skipped: true,
    };
  }

  const restaurants = await User.find({
    role: "restaurant",
    isActive: true,
  })
    .select("name contactNumber address location")
    .lean();

  const nearbyRestaurants = restaurants
    .map((restaurant) => {
      const restaurantCoordinates = getCoordinates(restaurant.location);
      const distanceKm = calculateDistanceKm(foodbankCoordinates, restaurantCoordinates);
      return {
        ...restaurant,
        _distanceKm: distanceKm,
      };
    })
    .filter((restaurant) =>
      Number.isFinite(restaurant._distanceKm) && restaurant._distanceKm <= maxDistanceKm,
    );

  let io = null;
  try {
    io = getIO();
  } catch (err) {
    io = null;
  }
  const notificationPayload = {
    requestId: request._id.toString(),
    foodbankId: request.foodbank_id.toString(),
    foodbankName: foodbank?.name || "Food Bank",
    foodbankAddress: foodbank?.address || "",
    foodName: request.foodName,
    foodType: request.foodType,
    requestedQuantity: request.requestedQuantity,
    radiusKm: maxDistanceKm,
  };

  const smsResults = await Promise.allSettled(
    nearbyRestaurants.map(async (restaurant) => {
      const distanceKm = restaurant._distanceKm;
      const distanceText = distanceKm === null ? "" : ` It is about ${distanceKm.toFixed(1)} km away.`;
      const message = [
        `${notificationPayload.foodbankName} needs ${request.requestedQuantity} servings of ${request.foodName}.`,
        `Food type: ${request.foodType}.`,
        `Location: ${notificationPayload.foodbankAddress || "Not provided"}.${distanceText}`,
        "Open SharePlate to respond.",
      ].join(" ");

      if (restaurant.contactNumber) {
        await sendSms(restaurant.contactNumber, message);
      }

      if (io) {
        io.to(restaurant._id.toString()).emit("new_food_request", {
          ...notificationPayload,
          restaurantId: restaurant._id.toString(),
          restaurantName: restaurant.name,
          distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
          itemName: request.foodName,
        });
      }

      return {
        restaurantId: restaurant._id.toString(),
        smsSent: Boolean(restaurant.contactNumber),
      };
    }),
  );

  if (io) {
    io.to(request.foodbank_id.toString()).emit("foodbank_request_created", {
      ...notificationPayload,
      restaurantCount: nearbyRestaurants.length,
    });
  }

  const smsSentCount = smsResults.filter((result) => result.status === "fulfilled" && result.value.smsSent).length;
  const smsFailedCount = smsResults.filter((result) => result.status === "rejected").length;

  return {
    restaurantCount: nearbyRestaurants.length,
    smsSentCount,
    smsFailedCount,
  };
}

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

  let notificationSummary = {
    restaurantCount: 0,
    smsSentCount: 0,
    smsFailedCount: 0,
    skipped: true,
  };

  try {
    notificationSummary = await notifyNearbyRestaurantsForRequest(request);
  } catch (notifyErr) {
    console.error("Failed to notify nearby restaurants for food request:", notifyErr);
  }

  return {
    message: "Request created successfully",
    request,
    notificationSummary,
  };
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
      .populate("restaurant_id", "name email address contactNumber location")
      .populate("pickup_id", "otp status")
      .lean();
    return { ...req, acceptances };
  }));

  return { message: "Requests retrieved successfully", requests: requestsWithAcceptances };
}

export async function getAllOpenRequestsService(user) {
  let filter = {};

  // Distance filtering for Restaurants viewing open requests from foodbanks
  if (user && user.role === "restaurant") {
    const currentUser = await User.findById(user.userId);
    if (currentUser && currentUser.location && currentUser.location.coordinates) {
      const maxDistanceKm = await getMaxDistanceSetting();
      const maxDistanceMeters = maxDistanceKm * 1000;

      // Find nearby foodbanks
      const nearbyFoodbanks = await User.find({
        role: "foodbank",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: currentUser.location.coordinates,
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      }).select("_id");

      const foodbankIds = nearbyFoodbanks.map(fb => fb._id);
      filter.foodbank_id = { $in: foodbankIds };
    }
  }

  // Return all requests matching filters
  const requests = await FoodRequest.find(filter)
    .populate("foodbank_id", "name email address location")
    .sort({ createdAt: -1 })
    .lean();

  // Attach acceptances for each request to provide breakdown per restaurant
  const requestsWithAcceptances = await Promise.all(requests.map(async (req) => {
    const acceptances = await Acceptance.find({ request_id: req._id })
      .populate('restaurant_id', 'name contactNumber address location')
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
