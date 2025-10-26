import express, { json } from "express";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

//importing routes
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(
  cors({
    origin: ["https://vystra.netlify.app", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());

//handling routes
app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/video", videoRoutes);

app.use("/api/v1/subscription", subscriptionRoutes);

app.use("/api/v1/comment", commentRoutes);

app.use("/api/v1/post", postRoutes);

app.use("/api/v1/like", likeRoutes);

app.use("/api/v1/playlist", playlistRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    status: "error",
    message,
  });
});

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
