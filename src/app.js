import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);
app.use(express.static("public"));
app.use(cors());
app.use(cookieParser());

// import route
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/comment.routes.js";
import playListRouter from "./routes/comment.routes.js";
import dashboardRouter from "./routes/comment.routes.js";
import tweetsRouter from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/comment.routes.js";
import healthCheckRouter from "./routes/comment.routes.js";
// route declearation
app.use("/api/v1/user", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playListRouter);
app.use("/api/v1/tweets", tweetsRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/health", healthCheckRouter);

export { app };
