import { getNearbyUsers } from "../../services/distanceService.js";

export const getNearbyTest = async (req, res) => {
  try {
    const { latitude, longitude, role } = req.body;

    const users = await getNearbyUsers({
      latitude,
      longitude,
      role,
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};