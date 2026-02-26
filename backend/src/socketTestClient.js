import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  // Join room
  socket.emit("join", "TEST_USER_ID");
});

socket.on("new_notification", (data) => {
  console.log("Received Notification:", data.message);
});