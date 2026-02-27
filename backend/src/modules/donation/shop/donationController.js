import {
  createDonationService,
  getAllDonationsService,
  getSingleDonationService,
  updateDonationService,
  deleteDonationService,
} from "./donationService.js";

export async function createDonation(req, res, next) {
  try {
    const donation = await createDonationService(req.body);
    return res.status(201).json(donation);
  } catch (error) {
    return next(error);
  }
}

export async function getAllDonations(req, res, next) {
  try {
    const { restaurant_id } = req.params || {};
    const query = { ...(req.query || {}) };
    if (restaurant_id) query.restaurant_id = restaurant_id;
    const donations = await getAllDonationsService(query);
    return res.status(200).json(donations);
  } catch (error) {
    return next(error);
  }
}

export async function getSingleDonation(req, res, next) {
  try {
    const { id } = req.params;
    const donation = await getSingleDonationService(id);
    return res.status(200).json(donation);
  } catch (error) {
    return next(error);
  }
}

export async function updateDonation(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const donation = await updateDonationService(id, updates);
    return res.status(200).json(donation);
  } catch (error) {
    return next(error);
  }
}

export async function deleteDonation(req, res, next) {
  try {
    const { id } = req.params;
    await deleteDonationService(id);
    return res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    return next(error);
  }
}
