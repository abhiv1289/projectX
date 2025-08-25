import express, { json } from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

//importing routes
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(
  cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
  })
);

app.use(cookieParser());

//handling routes
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/video", videoRoutes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port || 8000, () => {
      console.log("Server is running on port:", port);
    });
  } catch (error) {
    console.error("Error in starting the server!");
  }
};
startServer();
