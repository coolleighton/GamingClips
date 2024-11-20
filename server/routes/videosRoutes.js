const express = require("express");
const router = express.Router();
const videosController = require("../controllers/videosController");

router.post("/upload", videosController.uploadPost);

router.get("/user/:userId", videosController.getUserVideosGet);

router.delete("/:videoId", videosController.deleteVideoDelete);

module.exports = router;
