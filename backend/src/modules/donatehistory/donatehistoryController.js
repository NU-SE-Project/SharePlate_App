import mongoose from "mongoose";
import {
  fetchDonationHistory,
  fetchRequestHistory,
  fetchDonationHistoryByRestaurant,  // new
  fetchRequestHistoryByFoodbank,      // new
} from "../donatehistory/donatehistoryService.js";

// ─────────────────────────────────────────────
// GET /api/history/donations
// ─────────────────────────────────────────────
export async function getDonationHistory(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { role } = req.user;

    const history = await fetchDonationHistory(userId, role);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/history/requests
// ─────────────────────────────────────────────
export async function getRequestHistory(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { role } = req.user;

    const history = await fetchRequestHistory(userId, role);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}


// ─────────────────────────────────────────────
// GET /api/history/donations/restaurant/:restaurantId
// Admin can look up any restaurant | Restaurant can only look up themselves
// ─────────────────────────────────────────────
export async function getRestaurantDonationHistory(req, res, next) {
  try {
    const { restaurantId } = req.params;

    console.log(" Iam in :: , ",restaurantId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID" });
    }

    // Restaurant role can only view their own history
    if (req.user.role === "restaurant" && req.user.userId !== restaurantId) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only view your own donation history" });
    }

    const id = new mongoose.Types.ObjectId(restaurantId);
    const history = await fetchDonationHistoryByRestaurant(id);

    return res.status(200).json({
      success: true,
      restaurantId,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────
// GET /api/history/requests/foodbank/:foodbankId
// Admin can look up any foodbank | Foodbank can only look up themselves
// ─────────────────────────────────────────────
export async function getFoodbankRequestHistory(req, res, next) {
  try {
    const { foodbankId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(foodbankId)) {
      return res.status(400).json({ success: false, message: "Invalid foodbank ID" });
    }

    // Foodbank role can only view their own history
    if (req.user.role === "foodbank" && req.user.userId !== foodbankId) {
      return res.status(403).json({ success: false, message: "Forbidden: you can only view your own request history" });
    }

    const id = new mongoose.Types.ObjectId(foodbankId);
    const history = await fetchRequestHistoryByFoodbank(id);

    return res.status(200).json({
      success: true,
      foodbankId,
      count: history.length,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}