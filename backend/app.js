// app.js
import express, { json } from "express";

import foodRoutes from "./routes/foodRoutes.js";

const app = express();

app.use(json());

app.use("/foodsdonate", foodRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("API running");
});

export default app;
