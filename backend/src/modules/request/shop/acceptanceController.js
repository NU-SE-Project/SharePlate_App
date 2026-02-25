import FoodRequest from "../foodbank/FoodRequest.js";
import Acceptance from "../shop/Acceptance.js";

export const acceptFoodRequest = async (req, res) => {
  const { restaurantId, quantity } = req.body;
  const requestId = req.params.donateId; // ✅ get from URL

  const session = await FoodRequest.startSession();
  session.startTransaction();

  try {
    if (!quantity || quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const alreadyAccepted = await Acceptance.findOne({
      request_id: requestId,
      restaurant_id: restaurantId,
    }).session(session);

    if (alreadyAccepted) {
      throw new Error("You already accepted this request");
    }

    const request = await FoodRequest.findOneAndUpdate(
      {
        _id: requestId,
        status: "open",
        remainingQuantity: { $gte: quantity },
      },
      { $inc: { remainingQuantity: -quantity } },
      { new: true, session }
    );

    if (!request) {
      throw new Error("Not enough remaining food or request closed");
    }

    await Acceptance.create([{
      request_id: requestId,
      restaurant_id: restaurantId,
      acceptedQuantity: quantity,
    }], { session });

    if (request.remainingQuantity === 0) {
      request.status = "fulfilled";
      await request.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Accepted successfully",
      remainingQuantity: request.remainingQuantity,
      status: request.status,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
};