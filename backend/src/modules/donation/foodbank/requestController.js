import {
  createRequest,
  getRequestsByFoodbank,
  approveRequest as approveRequestService,
  rejectRequest as rejectRequestService,
} from "./requestService.js";

export async function getAllRequests(req, res, next) {
  try {
    const { foodBank_id } = req.params;
    const requests = await getRequestsByFoodbank({foodBank_id});
    return res.status(200).json({ requests });
  } catch (error) {
    return next(error);
  }
}

export async function requestFood(req, res, next) {
  try {
    const { restaurant_id, foodBank_id, requestedQuantity } = req.body;
    const food_id = req.params.food_id;

    const request = await createRequest({ food_id, restaurant_id, foodBank_id, requestedQuantity });

    return res.status(201).json({ message: "Request created successfully", request });
  } catch (error) {
    return next(error);
  }
}

export async function approveRequest(req, res, next) {
  try {
    const { request_id } = req.params;
    const request = await approveRequestService(request_id);
    return res.status(200).json({ message: "Request approved", request });
  } catch (error) {
    return next(error);
  }
}

export async function rejectRequest(req, res, next) {
  try {
    const { request_id } = req.params;
    const request = await rejectRequestService(request_id);
    return res.status(200).json({ message: "Request rejected", request });
  } catch (error) {
    return next(error);
  }
}