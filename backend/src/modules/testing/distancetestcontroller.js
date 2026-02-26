import { getNearbyUsers, getRouteDetails } from "../../services/distanceService.js";

export const getNearbyTest = async (req, res) => {
  try {
    const { latitude, longitude, role } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Missing latitude or longitude in request body. Make sure you set 'Content-Type: application/json' in Postman and select raw -> JSON."
      });
    }

    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      return res.status(400).json({ message: "Latitude and longitude must be valid numbers" });
    }

    const users = await getNearbyUsers({
      latitude: Number(latitude),
      longitude: Number(longitude),
      role,
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRouteDetailsController = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.body;

    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ message: "Missing coordinates" });
    }

    const details = await getRouteDetails([originLng, originLat], [destLng, destLat]);
    res.json({ success: true, ...details });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};