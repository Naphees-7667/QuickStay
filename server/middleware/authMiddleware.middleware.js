import User from "../models/user.models.js";

// middleware to check if user is authenticated

export const protect = async (req, res, next) => {
    const {userId} = req.auth;
    if(!userId){
        res.status(401).json({success: false, message: "Not authenticated"});
    }
    const user = await User.findById(userId);
    if(!user){
        res.status(401).json({success: false, message: "Not authenticated"});
    }
    req.user = user;
    next();
};