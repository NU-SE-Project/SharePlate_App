import Setting from "./Setting.js";

/**
 * Get the max distance setting
 * Default is 20 if not set
 */
export const getDistanceSetting = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: "max_distance" });
    if (!setting) {
      // Return default if not found in DB
      const defaultDistance = process.env.DISTANCE_KM ? parseFloat(process.env.DISTANCE_KM) : 20;
      return res.json({ key: "max_distance", value: defaultDistance });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update the max distance setting
 * (Admin only - handled by middleware in routes)
 */
export const updateDistanceSetting = async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined || isNaN(Number(value))) {
      return res.status(400).json({ message: "Valid distance value is required" });
    }

    const distance = Number(value);
    if (distance < 5 || distance > 100) {
      return res.status(400).json({ message: "Distance must be between 5km and 100km" });
    }

    let setting = await Setting.findOneAndUpdate(
      { key: "max_distance" },
      { value: distance },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
