import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";

export const healthCheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message
  return res.status(200).json(new apiResponse(200, {}, "Ok"));
});
