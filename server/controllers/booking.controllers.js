import Booking from "../models/booking.models.js";
import Room from "../models/room.models.js";
import Hotel from "../models/hotel.models.js";

// functions to check availability of room 

const checkAvailability = async ({checkInDate, checkOutDate, room}) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        });
    
        return bookings.length === 0;
        
    } catch (error) {
        console.log(error);
    }
};

//  API to check availability of room 
// POST /api/bookings/check-availability
export const checkRoomAvailabilityAPI = async (req, res) => {
    try {
        const {checkInDate, checkOutDate, room} = req.body;
        const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
        res.json({success: true, isAvailable});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API to create a new booking 
// POST /api/bookings/book

export const createBooking = async (req, res) => {
    try {
        const {checkInDate, checkOutDate, room, guests} = req.body;

        const user = req.user._id;

        const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});

        if(!isAvailable){
            return res.json({success: false, message: "Room is not available"});
        }

        // get total price for the room 
        const roomData = await Room.findById(room).populate("hotel");

        let totalPrice = roomData.pricePerNight;

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const timeDiff = checkOut.getTime() - checkIn.getTime();

        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        totalPrice = totalPrice * nights; 

        // create a new booking
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice
        });

        res.json({success: true, message: "Booking created successfully", booking});

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// API to get all bookings
// GET /api/bookings/user

export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate("room hotel").sort({ createdAt: -1 });

        res.json({success: true, bookings});

    } catch (error) {
        res.json({success: false, message: "failed to fetch bookings"});
    }
}



export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findById({owner: req.auth.userId});
        if(!hotel){
            return res.json({success: false, message: "Hotel not found"});
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate("room hotel user").sort({ createdAt: -1 });

        if(!bookings){
            return res.json({success: false, message: "No bookings found"});
        }

        const totalBookings = bookings.length;

        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.json({success: true, dashboardData: {totalBookings, totalRevenue,bookings}});

    } catch (error) {
       res.json({success: false, message: "failed to fetch all booking data"});
    }
}