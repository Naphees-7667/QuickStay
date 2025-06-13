import express from "express";
import { protect } from "../middleware/authMiddleware.middleware.js";
import { getUserData, storeRecentSearchedCities } from "../controllers/user.controllers.js";
import { requireAuth } from "@clerk/express";

const userRouter = express.Router();

userRouter.get("/",requireAuth(), protect,getUserData);
userRouter.post("/store-recent-search", requireAuth(),protect,storeRecentSearchedCities);


export default userRouter;