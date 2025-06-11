import express from "express";
import { protect } from "../middleware/authMiddleware.middleware.js";
import { getUserData } from "../controllers/userController.controllers.js";
const userRouter = express.Router();

userRouter.get("/", protect,getUserData);

export default userRouter;