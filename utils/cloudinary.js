const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Upload Image
const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });
    return data;
  } catch (error) {
    return error;
  }
};
// Cloudinary Remove Image
const cloudinaryRemoveImage = async (imagePublicId) => {
  try {
    const reult = await cloudinary.uploader.destroy(imagePublicId);
    return reult;
  } catch (error) {
    return error;
  }
};
// Cloudinary Remove multiple image
const cloudinaryRemoveMultipleImage = async (publicIds) => {
  try {
    const reult = await cloudinary.v2.api.delete_resources(publicIds);
    return reult;
  } catch (error) {
    return error;
  }
};
module.exports = {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
  cloudinaryRemoveMultipleImage,
};
