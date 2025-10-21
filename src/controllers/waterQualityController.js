// controllers/waterQualityController.js
const WaterQualitySample = require("../models/WaterQualitySample");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// @desc Upload and create new water quality sample record
exports.createSample = async (req, res) => {
  try {
    const { assetId, sampleDate, collectedBy, eColiCount, turbidity, chlorineResidual, ph, labName } = req.body;

    if (!assetId || !sampleDate)
      return res.status(400).json({ message: "assetId and sampleDate are required" });

    let uploadedReport = "";

    // Handle single file upload (PDF or image)
    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "washlab/water-quality", resource_type: "auto" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();
      uploadedReport = result.secure_url;
    }

    // Determine result status automatically
    let resultStatus = "pass";
    if (eColiCount > 0 || turbidity > 5 || chlorineResidual < 0.2) resultStatus = "fail";
    if (turbidity > 3 && turbidity <= 5) resultStatus = "warning";

    const newSample = await WaterQualitySample.create({
      asset: assetId,
      sampleDate,
      collectedBy,
      parameters: {
        eColiCount,
        turbidity,
        chlorineResidual,
        ph,
      },
      resultStatus,
      labName,
      reportFile: uploadedReport,
    });

    res.status(201).json({ message: "Water quality sample uploaded", sample: newSample });
  } catch (error) {
    console.error("Error creating sample:", error);
    res.status(500).json({ message: "Error uploading sample", error: error.message });
  }
};

// @desc Get water quality samples (filter by asset)
exports.getSamples = async (req, res) => {
  try {
    const { asset_id } = req.query;

    const query = asset_id ? { asset: asset_id } : {};
    const samples = await WaterQualitySample.find(query)
      .populate("asset", "siteName county")
      .sort({ sampleDate: -1 });

    res.json(samples);
  } catch (error) {
    console.error("Error fetching samples:", error);
    res.status(500).json({ message: "Error fetching samples", error: error.message });
  }
};
