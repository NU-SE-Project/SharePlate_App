import Notification from "../modules/notification/Notification.js";
import { getIO } from "../socket.js";

export const sendNotification = async (userId, message) => {
  //  Save in DB (schema expects `user_id`)
  const notification = await Notification.create({
    user_id: userId,
    message,
  });

  //  Emit real-time via socket (non-fatal)
  try {
    const io = getIO();
    if (io && userId) {
      io.to(userId.toString()).emit("new_notification", {
        message,
        notificationId: notification._id,
      });
    }
  } catch (emitErr) {
    console.error("Socket emit failed:", emitErr);
  }

  return notification;
};