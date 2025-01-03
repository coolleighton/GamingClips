require("dotenv").config();
const express = require("express");
const app = express();
const RateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("./cloudinaryConfig");

// Routes
const videosRoutes = require("./routes/videosRoutes");
const usersRoutes = require("./routes/usersRoutes");

// Body parser configurations
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.raw({ limit: "500mb" }));

// File upload configuration
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB
    },
    abortOnLimit: true,
    responseOnLimit: "File size is too large",
    uploadTimeout: 0, // Disable timeout
    parseNested: true,
    debug: true, // Enable debug mode
  })
);

// set CORS/Headers
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, content-type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // requests per minute
  validate: { xForwardedForHeader: false },
});

app.use(limiter); // Apply rate limiter to all requests

// connect to mongoDB
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Set Routes
app.use("/users", usersRoutes);
app.use("/videos", videosRoutes);

app.listen(5000, () => {
  console.log("server started on port 5000");
});
