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
import { clerkMiddleware } from "@clerk/express";

// Load environment variables
const isProduction = process.env.NODE_ENV === 'production';
const webhookURL = isProduction 
  ? 'https://quick-stay-backend-rho.vercel.app/api/clerk'
  : 'http://localhost:4000/api/clerk';

console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);
console.log('Webhook URL:', webhookURL);

connectDB();
connectCloudinary();

const app = express();

// ✅ Webhook route ONLY – with raw body middleware
// It needs to be before express.json()
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      console.log("Raw webhook request received");
      console.log("Headers:", req.headers);
      console.log("Raw body length:", req.body.length);
      
      // Pass through to the webhook handler
      clerkWebhooks(req, res);
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: error.message
      });
    }
  }
);

// Normal middlewares
app.use(express.json());
app.use(clerkMiddleware());

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