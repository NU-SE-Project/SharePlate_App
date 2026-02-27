import FoodRequest from "../foodbank/FoodRequest.js";
import Acceptance from "./Acceptance.js";

export async function acceptFoodRequestService({ requestId, restaurantId, quantity }) {
  const session = await FoodRequest.startSession();
  session.startTransaction();

  try {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      const err = new Error("Quantity must be greater than 0");
      err.statusCode = 400;
      throw err;
    }

    const alreadyAccepted = await Acceptance.findOne({
      request_id: requestId,
      restaurant_id: restaurantId,
    }).session(session);

    if (alreadyAccepted) {
      const err = new Error("You already accepted this request");
      err.statusCode = 400;
      throw err;
    }

    const request = await FoodRequest.findOneAndUpdate(
      {
        _id: requestId,
        status: "open",
        remainingQuantity: { $gte: qty },
      },
      { $inc: { remainingQuantity: -qty } },
      { new: true, session }
    );

    if (!request) {
      const err = new Error("Not enough remaining food or request closed");
      err.statusCode = 400;
      throw err;
    }

    await Acceptance.create([
      {
        request_id: requestId,
        restaurant_id: restaurantId,
        acceptedQuantity: qty,
      },
    ], { session });

    if (request.remainingQuantity === 0) {
      request.status = "fulfilled";
      await request.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      message: "Accepted successfully",
      remainingQuantity: request.remainingQuantity,
      status: request.status,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
