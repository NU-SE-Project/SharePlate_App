import Food from "../models/Food.js";
import Request from "../models/Request.js";

// Request food controller
export const requestFood = async (req, res) => {
	try {
		const { food_id, restaurant_id, foodBank_id, requestedQuantity } = req.body;

		// Find the food item
		const food = await Food.findById(food_id);
		if (!food) {
			return res.status(404).json({ message: "Food item not found" });
		}

		// Check if requested quantity is valid
		if (requestedQuantity > food.remainingQuantity) {
			return res.status(400).json({ message: "Requested quantity exceeds available food" });
		}
		if (requestedQuantity < 1) {
			return res.status(400).json({ message: "Requested quantity must be at least 1" });
		}

		// Create request
		const request = new Request({
			food_id,
			restaurant_id,
			foodBank_id,
			requestedQuantity,
			status: "approved",
		});
		await request.save();

		// Update food remaining quantity
		food.remainingQuantity -= requestedQuantity;
		await food.save();

		return res.status(201).json({ message: "Request created successfully", request });
	} catch (error) {
		return res.status(500).json({ message: "Server error", error: error.message });
	}
};
