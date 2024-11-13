const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/signup", usersController.signupPost);

router.post("/login", usersController.loginPost);

router.post("/checkAuth", usersController.checkAuthPost);

module.exports = router;
