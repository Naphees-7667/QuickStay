import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import clerkWebhooks from "./controllers/clerkWebhooks.controllers.js";

connectDB();
const app = express();

// Normal middlewares
app.use(cors());
app.use(express.json());

// ✅ Webhook route ONLY – with raw body middleware
app.post("/clerk-webhooks", express.raw({ type: "application/json" }), clerkWebhooks);

// Test route
app.get("/", (req, res) => {
  res.send("Hello from server");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
