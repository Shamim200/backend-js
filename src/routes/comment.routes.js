import { Router } from "express";
import { jwtVerify } from "../middleware/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
const router = Router();

router.use(jwtVerify); //Apply jwtVerify middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
