import { Router } from "express";
import {
  registerUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
  updateAvatar,
  changePassword,
  updateUserDetails,
  getCurrentUser,
  updateCoverImage,
  userChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { jwtVerify } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(logInUser);
// secure routes
router.route("/logout").post(jwtVerify, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").patch(jwtVerify, changePassword);
router.route("/current-user").get(jwtVerify, getCurrentUser);
router
  .route("/Updateavatar")
  .patch(jwtVerify, upload.single("avatar"), updateAvatar);
router
  .route("/UpdateCoverImage")
  .patch(jwtVerify, upload.single("coverImage"), updateCoverImage);
router.route("/user-account").patch(jwtVerify, updateUserDetails);
router.route("/c/:username").get(jwtVerify, userChannelProfile);
router.route("/history").get(jwtVerify, getWatchHistory);

export default router;
