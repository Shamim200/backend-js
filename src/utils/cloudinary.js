import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// upload file in cloudinary
async function uploadOnCloud(localFilePath, folder) {
  try {
    if (!localFilePath) return null;
    const uploadFile = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: "auto",
    });
    console.log(`upload to cloudinary done`, uploadFile.url);
    fs.unlinkSync(localFilePath);
    return uploadFile;
  } catch (error) {
    console.log(`Error while upload on cloudinarry: ${error}`);
    fs.unlinkSync(localFilePath);
    return null;
  }
}

// delete file in cloudinary
const deleteOnCloud = async (folder, cloudinaryUrl, resourceType) => {
  try {
    if (!cloudinaryUrl) return null;
    const url = cloudinaryUrl.split("/").slice(-1)[0].split(".")[0];
    console.log(url);
    // remove file from cloudinary->
    const response = await cloudinary.uploader.destroy(`${folder}/${url}`, {
      resource_type: resourceType,
    });
    console.log(response);
    return response;
  } catch (error) {
    console.log("Error on cloudinary file dees not deleted", error);
    return null;
  }
};

export { uploadOnCloud, deleteOnCloud };
