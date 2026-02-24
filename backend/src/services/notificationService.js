import Notification from "../modules/notification/Notification.js";
import { getIO } from "../socket.js";

export const sendNotification = async (userId, message) => {
  //  Save in DB
  const notification = await Notification.create({
    userId,
    message,
  });

  //  Emit real-time via socket
  const io = getIO();

  io.to(userId.toString()).emit("new_notification", {
    message,
    notificationId: notification._id,
  });

  return notification;
};