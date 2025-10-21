const Testimonial = require("../models/Testimonial");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// helper function for uploading buffer to cloudinary
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "testimonials" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @desc Create a new testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, email, packageName, rating, title, comment, status } = req.body;

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await streamUpload(file.buffer);
        uploadedImages.push(result.secure_url);
      }
    }

    const testimonial = await Testimonial.create({
      name,
      email,
      packageName,
      rating,
      title,
      status,
      comment,
      images: uploadedImages,
    });

    res.status(201).json(testimonial);
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get all testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching testimonials" });
  }
};

// @desc Get single testimonial
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: "Testimonial not found" });
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: "Error fetching testimonial" });
  }
};

// @desc Update a testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { name, email, packageName, rating, title, comment, status } = req.body;

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await streamUpload(file.buffer);
        uploadedImages.push(result.secure_url);
      }
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        packageName,
        rating,
        title,
        comment,
        status,
        $push: { images: { $each: uploadedImages } },
      },
      { new: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json(updatedTestimonial);
  } catch (error) {
    res.status(500).json({ message: "Error updating testimonial", error: error.message });
  }
};

// @desc Delete a testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting testimonial" });
  }
};

// @desc Get approved testimonials only
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "approved" }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching approved testimonials" });
  }
};

// @desc Update only testimonial status
exports.updateTestimonialStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: "Error updating testimonial status", error: error.message });
  }
};


