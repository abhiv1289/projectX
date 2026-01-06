import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("already connected to database");
    return;
  }
  try {
    const res = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("database connected succesfully");
  } catch (error) {
    console.log("error connecting to db", error);
    throw error;
  }
};

export default connectDB;
