import { acceptFoodRequestService } from "./acceptanceService.js";

export async function acceptFoodRequest(req, res, next) {
  try {
    const { restaurantId, quantity } = req.body;
    const requestId = req.params.donateId;

    const result = await acceptFoodRequestService({ requestId, restaurantId, quantity });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}