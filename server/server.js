import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.configs.js";
import clerkWebhooks from "./controllers/clerkWebhooks.controllers.js";
import userRouter from "./routes/user.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import connectCloudinary from "./configs/cloudinary.configs.js";
import roomRouter from "./routes/room.routes.js";
import bookingRouter from "./routes/booking.routes.js";

connectDB();
connectCloudinary();

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
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});