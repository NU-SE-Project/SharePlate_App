import FoodRequest from "../foodbank/FoodRequest.js";
import Acceptance from "./Acceptance.js";
import { getIO } from "../../../socket.js";
import { createPickupOTPService } from "../../pickup/pickupService.js";

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

    // Generate OTP and create Pickup
    const { pickup, otp } = await createPickupOTPService({
      request_id: requestId,
      restaurant_id: restaurantId,
      foodbank_id: request.foodbank_id,
    });

    const [acceptance] = await Acceptance.create([
      {
        request_id: requestId,
        restaurant_id: restaurantId,
        acceptedQuantity: qty,
        pickup_id: pickup._id,
      },
    ], { session });

    if (request.remainingQuantity === 0) {
      request.status = "fulfilled";
      await request.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Emit real-time events to inform the foodbank and update donation states
    try {
      const io = getIO();
      if (io && request && request.foodbank_id) {
        io.to(request.foodbank_id.toString()).emit("request_accepted", {
          requestId,
          acceptedQuantity: qty,
          status: request.status,
        });
      }
      if (io) {
        io.emit("donation_updated", {
          requestId,
          remainingQuantity: request.remainingQuantity,
        });
      }
    } catch (emitErr) {
      console.error("Socket emit failed for acceptance:", emitErr);
    }

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
