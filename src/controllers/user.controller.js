import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import { uploadOnCloud, deleteOnCloud } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// create custom methods
const genarateAccesTokenandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genarateAccesToken();
    const refreshToken = user.genarateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while genarate access token and refresh token"
    );
  }
};
//register controller
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { fullname, username, email, password } = req.body;
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "all field are required");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "all ready user!");
  }
  console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "avatar is required.");
  }

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  const avatar = await uploadOnCloud(avatarLocalPath, "youtube/userAvatar");
  const coverImage = await uploadOnCloud(
    coverImageLocalPath,
    "youtube/userCoverImage"
  );

  if (!avatar) {
    throw new apiError(401, "Error while avatar does not upload!");
  }

  const users = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(users._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "Created User Successfully"));
});
// login controller
const logInUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new apiError(400, "Username or Email is required");
  }
  // if (!(username || email)) {
  //   throw new apiError(400, "Username or Email is required");
  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new apiError(400, "User does not exits.");
  }
  const isValidPassword = await user.isCorrectPassword(password);
  if (!isValidPassword) {
    throw new apiError(401, "Invalid user credentials.");
  }
  const { accessToken, refreshToken } = await genarateAccesTokenandRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully."
      )
    );
});
// logout controller
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      // $set: {
      //   refreshToken: undefined,
      // },
      // $set: {
      //   refreshToken: null,
      // },
      // $unset: {
      //   refreshToken: 1,
      // },
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out"));
});
// create updated refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request.");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN
    );
    if (!decodedToken) {
      throw new apiError(401, "Invalid refresh token");
    }
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "refesh token is expired or used.");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await genarateAccesTokenandRefreshToken(userId);

    return res
      .status(200)
      .cookie("AccessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed successfully..."
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message, "Invalid refresh token");
  }
});
// change user password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  //   check old passowrd match with current password
  const user = await User.findById(req.user?._id);
  const isPassword = await user.isCorrectPassword(oldPassword);
  // check password
  if (!isPassword) {
    throw new apiError(400, "Password is incorrect.");
  }
  // set new password and save to the database
  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });
  return res
    .status(200)
    .json(new apiResponse(200, {}, "User password updated."));
});
// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new apiResponse(200, req.user, "current user fetched successfully...")
    );
});
// updated user deatails
const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  // check fullname and email
  if (!(fullname || email)) {
    throw new apiError(400, "All fields are required.");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new apiResponse(200, user, "user details are updated."));
});
// change user profile picture
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new apiError(401, "avatar is missing!");
  }
  const currentUser = await User.findById(req.user?._id);
  // assignment old image delete from cloudinary ->
  const deleteAvatar = await deleteOnCloud(
    "youtube/userAvatar",
    currentUser.avatar,
    "image"
  );
  if (!deleteAvatar) {
    throw new apiError(401, "old avatar does not deleted!");
  }
  const avatarUrl = await uploadOnCloud(
    avatarLocalPath,
    "image",
    "youtube/userAvatar"
  );
  if (!avatarUrl?.url) {
    throw new apiError(500, "server error while uploading the image!");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUrl?.url,
      },
    },
    { new: true }
  );
  return res
    .status(201)
    .json(new apiResponse(200, user, "avatar updated successfully."));
});
// change cover Image
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new apiError(401, "coverImage is missing!");
  }
  const coverImage = await uploadOnCloud(
    "youtube/userCoverImage",
    coverImageLocalPath,
    "image"
  );
  if (!coverImage) {
    throw new apiError(401, "Error while uploading on coverImage!");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new apiResponse(200, user, "updated coverImage successfully."));
});
// channel profile
const userChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new apiError(400, "username is missing...");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelSubscribedTo: 1,
        isSubscribed: 1,
      },
    },
  ]);

  // check channel
  if (!channel?.length) {
    throw new apiError(400, "channel does not exists.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, channel[0], "user channel fetched successfully.")
    );
});
// user watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully."
      )
    );
});

export {
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
};
