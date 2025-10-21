// controllers/docsController.js
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const CarbonPeriod = require("../models/CarbonPeriod");

// @desc List all documents in a Cloudinary folder (optional path param)
exports.listDocuments = async (req, res) => {
  try {
    const { path } = req.query;
    const folderPath = path || "washlab/docs";

    const result = await cloudinary.search
      .expression(`folder:${folderPath}`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    const files = result.resources.map((f) => ({
      public_id: f.public_id,
      format: f.format,
      url: f.secure_url,
      created_at: f.created_at,
      bytes: f.bytes,
      folder: f.folder,
      resource_type: f.resource_type,
    }));

    res.json({ total: files.length, folder: folderPath, files });
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ message: "Error listing documents", error: error.message });
  }
};

// @desc Upload a document or image to Cloudinary
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const { folder } = req.body;
    const uploadFolder = folder || "washlab/docs";

    // Upload file buffer using Cloudinary stream
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: uploadFolder, resource_type: "auto" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        folder: uploadFolder,
        bytes: result.bytes,
        created_at: result.created_at,
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: "Error uploading document", error: error.message });
  }
};

// @desc Pin uploaded document to a carbon period for evidence tracking
exports.pinDocument = async (req, res) => {
  try {
    const { periodId, fileUrl, description } = req.body;

    if (!periodId || !fileUrl)
      return res.status(400).json({ message: "periodId and fileUrl are required" });

    const period = await CarbonPeriod.findById(periodId);
    if (!period)
      return res.status(404).json({ message: "Carbon period not found" });

    const fileRecord = {
      url: fileUrl,
      description: description || "Evidence Document",
      pinnedAt: new Date(),
    };

    period.documents = period.documents || [];
    period.documents.push(fileRecord);
    await period.save();

    res.json({ message: "Document pinned successfully", period });
  } catch (error) {
    console.error("Error pinning document:", error);
    res.status(500).json({ message: "Error pinning document", error: error.message });
  }
};
