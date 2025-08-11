import express, { json } from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

app.listen(port || 8000, () => {
  console.log("Server is running on port", port);
  connectDB();
});
