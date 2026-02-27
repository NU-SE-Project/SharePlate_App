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

export const getRequestsByFoodbank = async (req, res) => {
  try {
    const { foodbankId } = req.params;

    const requests = await FoodRequest.find({ foodbank_id: foodbankId }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateFoodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { foodName, foodType, requestedQuantity, status } = req.body;

    const request = await FoodRequest.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (requestedQuantity !== undefined) {
      const acceptedSoFar = request.requestedQuantity - request.remainingQuantity;
      if (requestedQuantity < acceptedSoFar) {
        return res.status(400).json({ error: "requestedQuantity cannot be less than already accepted quantity" });
      }
      request.requestedQuantity = requestedQuantity;
      request.remainingQuantity = Math.max(0, requestedQuantity - acceptedSoFar);
    }

    if (foodName !== undefined) request.foodName = foodName;
    if (foodType !== undefined) request.foodType = foodType;
    if (status !== undefined) request.status = status;

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteFoodRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await FoodRequest.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json({ message: "Request deleted", request });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};