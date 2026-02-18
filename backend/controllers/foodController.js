import Donation from "../models/Food.js";
import mongoose from "mongoose";

// CREATE
export const createDonation = async (req, res) => {
  try {
    const {
      restaurant_id,
      foodName,
      description,
      foodType,
      totalQuantity,
      expiryTime,
      pickupWindowStart,
      pickupWindowEnd,
      imageUrl,
    } = req.body;

    // Validation
    if (!restaurant_id || !foodName || !totalQuantity || !expiryTime || !pickupWindowStart || !pickupWindowEnd) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
      return res.status(400).json({ message: "Invalid restaurant_id" });
    }

    if (totalQuantity <= 0) {
      return res.status(400).json({ message: "Total quantity must be greater than 0" });
    }

    const expiry = new Date(expiryTime);
    const start = new Date(pickupWindowStart);
    const end = new Date(pickupWindowEnd);

    if (end <= start) {
      return res.status(400).json({ message: "Pickup end time must be after start time" });
    }

    if (expiry <= new Date()) {
      return res.status(400).json({ message: "Expiry time must be in the future" });
    }

    if (end > expiry) {
      return res.status(400).json({ message: "Pickup window must end before expiry time" });
    }

    const donation = await Donation.create({
      restaurant_id,
      foodName,
      description,
      foodType,
      totalQuantity,
      remainingQuantity: totalQuantity,
      expiryTime: expiry,
      pickupWindowStart: start,
      pickupWindowEnd: end,
      imageUrl,
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ALL
export const getAllDonations = async (req, res) => {
  try {
    const { status, foodType } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (foodType) filter.foodType = foodType;

    const donations = await Donation.find(filter).sort({ expiryTime: 1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
export const getSingleDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid donation ID" });
    }

    const donation = await Donation.findById(id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


