import mongoose, { isValidObjectId } from "mongoose";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweets } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
// create tweet
const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new apiError(401, "content is required!");
  }
  const tweets = await Tweets.create({
    content,
  });
  if (!tweets) {
    throw new apiError(500, "something went wrong while tweet creating!");
  }
  return res
    .status(200)
    .json(new apiResponse(200, tweets, "tweets create successfully."));
});
// get user tweet
const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});
// updated user tweet
const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});
// remove user tweet
const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
