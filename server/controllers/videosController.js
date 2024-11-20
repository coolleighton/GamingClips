const User = require("../models/userModel");
const cloudinary = require("../cloudinaryConfig");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.uploadPost = async (req, res) => {
  let tempFilePath = null;

  try {
    console.log("Starting upload process");

    // Verify user exists and account is setup
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if a file was uploaded
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const videoFile = req.files.video;
    tempFilePath = videoFile.tempFilePath;

    console.log("File details:", {
      size: videoFile.size,
      mimetype: videoFile.mimetype,
      name: videoFile.name,
      tempFilePath: videoFile.tempFilePath,
    });

    // Simpler upload options
    const uploadOptions = {
      resource_type: "video",
      folder: "gaming_clips",
      public_id: `video_${Date.now()}`, // Ensure unique filename
    };

    console.log("Starting Cloudinary upload...");
    const cloudinaryResponse = await cloudinary.uploader.upload(
      videoFile.tempFilePath,
      uploadOptions
    );
    console.log("Cloudinary upload complete", cloudinaryResponse);

    // Update user's videos array
    user.videos.push({
      title: req.body.title || videoFile.name,
      url: cloudinaryResponse.secure_url,
      cloudinaryId: cloudinaryResponse.public_id,
      uploadDate: new Date(),
    });

    await user.save();

    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await unlinkFile(tempFilePath);
    }

    res.status(200).json({
      message: "Video uploaded successfully",
      video: {
        title: req.body.title || videoFile.name,
        url: cloudinaryResponse.secure_url,
        uploadDate: new Date(),
      },
    });
  } catch (error) {
    console.error("Upload error full details:", error);

    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await unlinkFile(tempFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temp file:", unlinkError);
      }
    }

    // More detailed error response
    let errorMessage = "Error uploading video";
    if (error.http_code === 413) {
      errorMessage = "File size exceeds limit. Please try a smaller file.";
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message || "Unknown error occurred",
    });
  }
};

exports.getUserVideosGet = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Sort videos by upload date (most recent first)
    const sortedVideos = user.videos.sort(
      (a, b) => b.uploadDate - a.uploadDate
    );

    res.status(200).json(sortedVideos);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Error fetching videos" });
  }
};

exports.deleteVideoDelete = async (req, res) => {
  try {
    const user = await User.findOne({ "videos._id": req.params.videoId });
    if (!user) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Find the video in the user's videos array
    const video = user.videos.id(req.params.videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.cloudinaryId, {
      resource_type: "video",
    });

    // Remove video from user's videos array
    user.videos.pull({ _id: req.params.videoId });
    await user.save();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Error deleting video" });
  }
};
