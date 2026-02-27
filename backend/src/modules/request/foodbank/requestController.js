import {
  createFoodRequestService,
  getRequestsByFoodbankService,
  updateFoodRequestService,
  deleteFoodRequestService,
} from "./foodRequestService.js";

export async function createFoodRequest(req, res, next) {
  try {
    const { foodbank_id, foodName, foodType, requestedQuantity } = req.body;
    const request = await createFoodRequestService({ foodbank_id, foodName, foodType, requestedQuantity });
    return res.status(201).json(request);
  } catch (err) {
    return next(err);
  } 
}

export async function getRequestsByFoodbank(req, res, next) {
  try {
    const { foodbankId } = req.params;
    const requests = await getRequestsByFoodbankService(foodbankId);
    return res.json(requests);
  } catch (err) {
    return next(err);
  }
}

export async function updateFoodRequest(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const request = await updateFoodRequestService(id, updates);
    return res.json(request);
  } catch (err) {
    return next(err);
  }
}

export async function deleteFoodRequest(req, res, next) {
  try {
    const { id } = req.params;
    const request = await deleteFoodRequestService(id);
    return res.json({ message: "Request deleted", request });
  } catch (err) {
    return next(err);
  }
}