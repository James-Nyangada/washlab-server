// controllers/hygieneController.js
const HygieneSession = require("../models/HygieneSession");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// @desc Create new hygiene session with photos upload
exports.createSession = async (req, res) => {
  try {
    const { assetId, sessionDate, trainerName, location, participants, topicsCovered, remarks } = req.body;

    if (!assetId || !sessionDate)
      return res.status(400).json({ message: "assetId and sessionDate are required" });

    let uploadedPhotos = [];

    // Upload multiple photos if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const streamUpload = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "washlab/hygiene-sessions", resource_type: "auto" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });

        const result = await streamUpload();
        uploadedPhotos.push(result.secure_url);
      }
    }

    const parsedParticipants = participants ? JSON.parse(participants) : { men: 0, women: 0, youth: 0 };
    const parsedTopics = topicsCovered ? JSON.parse(topicsCovered) : [];

    const newSession = await HygieneSession.create({
      asset: assetId,
      sessionDate,
      trainerName,
      location,
      participants: parsedParticipants,
      topicsCovered: parsedTopics,
      photos: uploadedPhotos,
      remarks,
    });

    res.status(201).json({ message: "Hygiene session created", session: newSession });
  } catch (error) {
    console.error("Error creating hygiene session:", error);
    res.status(500).json({ message: "Error creating hygiene session", error: error.message });
  }
};

// @desc Get hygiene sessions (optionally by asset)
exports.getSessions = async (req, res) => {
  try {
    const { asset_id } = req.query;

    const query = asset_id ? { asset: asset_id } : {};
    const sessions = await HygieneSession.find(query)
      .populate("asset", "siteName county")
      .sort({ sessionDate: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching hygiene sessions:", error);
    res.status(500).json({ message: "Error fetching sessions", error: error.message });
  }
};
