import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGODB_URI);

    console.log("database connected succesfully");
  } catch (error) {
    console.log("error connecting to db", error);
  }
};

export default connectDB;
