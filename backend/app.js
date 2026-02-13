// app.js
import express, { json } from "express";

const app = express();

app.use(json());

// Routes
app.get("/", (req, res) => {
  res.send("API running");
});

export default app;
