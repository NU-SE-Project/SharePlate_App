import { acceptFoodRequestService } from "./acceptanceService.js";

export async function acceptFoodRequest(req, res, next) {
  try {
    const { restaurantId: bodyRestaurantId, quantity } = req.body;
    const requestId = req.params.donateId;
    // If restaurantId not provided in body, derive from authenticated token
    const restaurantId = bodyRestaurantId || (req.user && (req.user.userId || req.user.id));

    const result = await acceptFoodRequestService({ requestId, restaurantId, quantity });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}