const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the video schema
const videoSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  url: {
    type: String,
    required: true,
    maxLength: 500,
  },
  cloudinaryId: {
    type: String,
    required: true,
    maxLength: 250,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Define the user schema with the videos array
const userSchema = new Schema({
  email: { type: String, required: true, minLength: 8, maxLength: 150 },
  username: { type: String, required: true, minLength: 4, maxLength: 150 },
  password: { type: String, required: true, minLength: 8, maxLength: 64 },
  accountSetup: { type: Boolean, required: true },
  videos: [videoSchema], // Array of video documents
});

module.exports = mongoose.model("user", userSchema);
