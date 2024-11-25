const path = require("path");
const multer = require("multer");

// Photo Storage Configuration
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// Create Multer Instance
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
});

const multiPhotoUpload = photoUpload.fields([
  { name: "image", maxCount: 1 }, // رفع صورة واحدة لحقل image
  { name: "backGround", maxCount: 1 }, // رفع صورة واحدة لحقل backGround
]);

module.exports = { photoUpload, multiPhotoUpload };
// module.exports = { photoUpload };
