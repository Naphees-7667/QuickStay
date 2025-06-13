import express from "express";
import upload from "../middleware/multer.middleware.js";
import { protect } from "../middleware/authMiddleware.middleware.js";
import { createRoom, getOwnerRooms, getRooms, toggleRoomAvailability } from "../controllers/room.controllers.js";
import { requireAuth } from "@clerk/express";

const roomRouter = express.Router();

roomRouter.post("/", upload.array("images",4),requireAuth(),protect, createRoom);

roomRouter.get("/",getRooms);

roomRouter.get("/owner",requireAuth(),protect,getOwnerRooms);

roomRouter.post("/toggle-availability",requireAuth(),protect,toggleRoomAvailability);


export default roomRouter;