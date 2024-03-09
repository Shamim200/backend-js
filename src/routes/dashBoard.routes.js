import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashBoard.controller.js";
import { jwtVerify } from "../middleware/auth.middleware.js";
const router = Router();
router.use(jwtVerify);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
