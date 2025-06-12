import Hotel from "../models/hotel.models.js";
import Room from "../models/room.models.js";
import { v2 as cloudinary } from "cloudinary";
// API to create  new room
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const hotel = await Hotel.findById({ owner: req.auth.userId });

    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found" });
    }
    const uploadedImages = req.files.map(async (file) => {
      const res = await cloudinary.uploader.upload(file.path);
      return res.secure_url;
    });
    const images = await Promise.all(uploadedImages);
    const room = await Room.create({
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
      hotel: hotel._id,
    });
    res.json({ success: true, message: "Room created successfully", room });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get all rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).populate({
      path: "hotel",
      populate:{
        path:"owner",
        select:"image"
      }
    }).sort({ createdAt: -1 });

    res.json({ success: true, rooms });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to get room details for a specific hotels 
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findById({ owner: req.auth.userId });
    const room = await Room.find({ hotel: hotelData._id.toString() }).populate({
      path: "hotel"
    })

    res.json({ success: true, room });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to toggle room availability 

export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }
    room.isAvailable = !room.isAvailable;
    await room.save();
    res.json({ success: true, message: "Room availability toggled successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};