import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.configs.js";
import clerkWebhooks from "./controllers/clerkWebhooks.controllers.js";
import userRouter from "./routes/user.routes.js";
import hotelRouter from "./routes/hotel.routes.js";

connectDB();
const app = express();

// Normal middlewares
app.use(cors());
app.use(express.json());

// ✅ Webhook route ONLY – with raw body middleware
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// Test route
app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});