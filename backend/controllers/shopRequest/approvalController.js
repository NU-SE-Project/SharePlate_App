import mongoose from "mongoose";
import Request from "../../models/Request.js";
import Food from "../../models/Food.js";

// Approve a request
export const approveRequest = async (req, res, next) => {
	try {
		const { request_id } = req.params;

		if (!request_id || !mongoose.Types.ObjectId.isValid(request_id)) {
			return res.status(400).json({ message: "Invalid or missing request_id" });
		}

		const request = await Request.findById(request_id);
		if (!request) return res.status(404).json({ message: "Request not found" });

		if (request.status === "approved") {
			return res.status(400).json({ message: "Request already approved" });
		}
		if (request.status === "rejected") {
			return res.status(400).json({ message: "Request already rejected" });
		}

		request.status = "approved";
		request.approvedAt = new Date();
		await request.save();

		return res.status(200).json({ message: "Request approved", request });
	} catch (error) {
		return next(error);
	}
};

// Reject a request and restore food quantity
export const rejectRequest = async (req, res, next) => {
	try {
		const { request_id } = req.params;

		if (!request_id || !mongoose.Types.ObjectId.isValid(request_id)) {
			return res.status(400).json({ message: "Invalid or missing request_id" });
		}

		const request = await Request.findById(request_id);
		if (!request) return res.status(404).json({ message: "Request not found" });

		if (request.status === "approved") {
			return res.status(400).json({ message: "Cannot reject an already approved request" });
		}
		if (request.status === "rejected") {
			return res.status(400).json({ message: "Request already rejected" });
		}

		// restore the food quantity reserved when request was created
		const food = await Food.findById(request.food_id);
		if (food) {
			// restore requested quantity and cap at totalQuantity if provided
			const addQty = Number(request.requestedQuantity) || 0;
			food.remainingQuantity = (Number(food.remainingQuantity) || 0) + addQty;
			if (typeof food.totalQuantity === "number") {
				food.remainingQuantity = Math.min(food.remainingQuantity, food.totalQuantity);
			}
			// if any quantity available, mark as available
			if (food.remainingQuantity > 0) {
				food.status = "available";
			}
			await food.save();
		}

		request.status = "rejected";
		request.rejectedAt = new Date();
		await request.save();

		return res.status(200).json({ message: "Request rejected", request });
	} catch (error) {
		return next(error);
	}
};

