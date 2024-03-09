import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloud, deleteOnCloud } from "../utils/cloudinary.js";

// get all videos
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});
// upload videos
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((fields) => fields === "")) {
    throw new apiError(401, "all fields are required!");
  }

  let thumbnailFileLocalPath;
  let videoFileLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    Array.isArray(req.files.thumbnail)
  ) {
    thumbnailFileLocalPath = req.files?.thumbnail[0]?.path;
    videoFileLocalPath = req.files?.videoFile[0]?.path;
  }

  if (!thumbnailFileLocalPath && !videoFileLocalPath) {
    throw new apiError(401, "thumbnail and video is missing");
  }

  const thumbnailUrl = await uploadOnCloud(
    thumbnailFileLocalPath,
    "youtube/Thumbnail"
  );
  const videoUrl = await uploadOnCloud(videoFileLocalPath, "youtube/Videos");

  if (!thumbnailUrl) {
    throw new ApiError(500, "Some thing went wrong while uploading thumbnail");
  }

  if (!videoUrl) {
    throw new ApiError(500, "Some thing went wrong while uploading video");
  }
  const upload = await Video.create({
    title,
    description,
    videoFile: videoUrl?.url,
    thumbnail: thumbnailUrl?.url,
    owner: req.user,
  });

  if (!upload) {
    throw new ApiError(
      500,
      "Some thing went wrong while publishing video try again later"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, upload, "video published successfully"));
});

// get single video by id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new apiError(401, "Invalid video id!");
  }
  const videos = await Video.findById(videoId);
  if (!videos) {
    throw new apiError(401, "video is missing!");
  }
  return res
    .status(200)
    .json(new apiResponse(200, videos, "fetched video successfully."));
});
// update video by id
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail
  if (!isValidObjectId(videoId)) {
    throw new apiError(401, "invalid video id");
  }

  // delete thumbnail from cloudinary
});
// delete video by id
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
