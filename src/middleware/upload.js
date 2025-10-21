// server/src/middlewares/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "wow-radio", // everything will go inside this folder in Cloudinary
      resource_type: "auto", // allows images, audio, video
      public_id: file.originalname.split(".")[0] + "-" + Date.now(), // unique name
    };
  },
});

// Multer middleware
const upload = multer({ storage: storage });

module.exports = upload;
