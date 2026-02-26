import FoodRequest from "../foodbank/FoodRequest.js";
import Acceptance from "../shop/Acceptance.js";

export const createFoodRequest = async (req, res) => {
  try {
    const { foodbank_id , foodName, foodType, requestedQuantity } = req.body;

    if (!requestedQuantity || requestedQuantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    const request = await FoodRequest.create({
      foodbank_id: foodbank_id,
      foodName,
      foodType,
      requestedQuantity,
      remainingQuantity: requestedQuantity,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await FoodRequest
      .findById(id)
      .populate("foodbank_id", "name");

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const acceptances = await Acceptance
      .find({ request_id: id })
      .populate("restaurant_id", "name address");

    res.json({
      request,
      acceptedBy: acceptances.map(a => ({
        restaurant: a.restaurant_id.name,
        address: a.restaurant_id.address,
        quantity: a.acceptedQuantity,
      })),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};