import { sendNotification } from "../../services/notificationService.js";

export const testNotification = async (req, res) => {
  try {
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({
        success: false,
        message: "user_id and message required",
      });
    }

    await sendNotification(user_id, message);

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};