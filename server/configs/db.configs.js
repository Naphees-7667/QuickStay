import mongoose from "mongoose";    

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB is connected");
        })
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;