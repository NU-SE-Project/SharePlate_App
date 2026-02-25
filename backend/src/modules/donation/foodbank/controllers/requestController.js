import mongoose from "mongoose";
import Food from "../../shop/Donation.js";
import Request from "../Request.js";
import User from "../../../user/User.js";
import { sendSms } from "../../../../services/notifyService.js";

// Request food controller
export const requestFood = async (req, res, next) => {
  try {
    const { restaurant_id, foodBank_id, requestedQuantity } = req.body;
    const food_id = req.params.food_id;

    // Validate ObjectId values
    if (!food_id || !mongoose.Types.ObjectId.isValid(food_id)) {
      return res.status(400).json({ message: "Invalid or missing food_id" });
    }
    if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
      return res.status(400).json({ message: "Invalid restaurant_id" });
    }
    if (!mongoose.Types.ObjectId.isValid(foodBank_id)) {
      return res.status(400).json({ message: "Invalid foodBank_id" });
    }

    // Validate requestedQuantity
    const qty = Number(requestedQuantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res
        .status(400)
        .json({ message: "requestedQuantity must be an integer >= 1" });
    }

    // Find the food item
    const food = await Food.findById(food_id);
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Check if requested quantity is valid
    if (qty > food.remainingQuantity) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available food" });
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
    // Use provided `restaurant_id` from body, otherwise fall back to the donation's owner.
    try {
      const restaurantId =
        restaurant_id && mongoose.Types.ObjectId.isValid(restaurant_id)
          ? restaurant_id
          : food.restaurant_id;

      const restaurant = await User.findById(restaurantId).select(
        "contactNumber name",
      );

      if (restaurant && restaurant.contactNumber) {
        const msg = `Hello ${restaurant.name || "Restaurant"}, you have a new food request for ${food.foodName || "an item"}. Quantity: ${qty}.`;
        await sendSms(restaurant.contactNumber, msg);
      }
    } catch (notifyErr) {
      // Log notification error but don't fail the request creation
      console.error("Failed to send SMS notification:", notifyErr);
    }

    return res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    return next(error);
  }
};
