const User = require("../models/userModel");
const cloudinary = require("../cloudinaryConfig");

exports.uploadPost = async (req, res) => {
  try {
    // Verify user exists and account is setup
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.accountSetup) {
      return res.status(403).json({ error: "Account setup not completed" });
    }

    // Check if a file was uploaded
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const videoFile = req.files.video;

    // Validate file type
    if (!videoFile.mimetype.startsWith("video/")) {
      return res.status(400).json({ error: "File must be a video" });
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (videoFile.size > maxSize) {
      return res
        .status(400)
        .json({ error: "File size must be less than 500MB" });
    }

    // Validate title
    if (
      !req.body.title ||
      req.body.title.length < 1 ||
      req.body.title.length > 100
    ) {
      return res
        .status(400)
        .json({ error: "Title must be between 1 and 100 characters" });
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
      videoFile.tempFilePath,
      {
        resource_type: "video",
        folder: "gaming_clips",
        eager: [{ quality: "auto", fetch_format: "auto" }],
        eager_async: true,
      }
    );

    // Create new video object
    const newVideo = {
      title: req.body.title,
      url: cloudinaryResponse.secure_url,
      cloudinaryId: cloudinaryResponse.public_id,
      uploadDate: new Date(),
    };

    // Add video to user's videos array
    user.videos.push(newVideo);
    await user.save();

    res.status(200).json({
      message: "Video uploaded successfully",
      video: newVideo,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading video" });
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
