const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// restrict file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPG, PNG, HEIC and HEIF are allowed."));
  }
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const originalName = file.originalname.split(".")[0]; // Remove file extension

    return {
      folder: "consent_forms",
      public_id: originalName, // 👈 use original filename without extension
      allowed_formats: ["pdf", "png", "jpg", "jpeg", "heic", "heif"],
      resource_type: "auto",
      overwrite: true, // Optional: replace if a file with same name exists
    };
  },
});

const upload = multer({ storage, fileFilter });

module.exports = upload;
