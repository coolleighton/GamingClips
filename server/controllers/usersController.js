const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JwtSecretKey = process.env.JWT_SECRET_KEY;

// Helper function to format user data consistently
const formatUserData = (user) => ({
  _id: user._id,
  email: user.email,
  username: user.username,
  accountSetup: user.accountSetup,
  videos: user.videos,
});

exports.signupPost = [
  async (req, res, next) => {
    console.log("Tried signing up");
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        console.log("unable to hash");
        return res.status(500).json({ error: "Password hashing failed" });
      }

      try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(404).json({
            error:
              "This email address is already associated with an account. Try a different email or try to login.",
            isUser: true,
          });
        }

        const user = new User({
          email: req.body.email,
          username: req.body.username,
          password: hashedPassword,
          accountSetup: false,
          videos: [],
        });

        const result = await user.save();

        res.status(201).json({
          user: formatUserData(result),
        });
      } catch (err) {
        res.status(500).json({ error: "Error creating user" });
        return next(err);
      }
    });
  },
];

exports.loginPost = [
  async (req, res, next) => {
    console.log("tried logging in");
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
          error:
            "The credentials you entered were incorrect. Try a different email/password or sign up.",
        });
      }

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return res.status(404).json({
          error:
            "The credentials you entered were incorrect. Try a different email/password or sign up.",
        });
      }

      const userData = formatUserData(user);

      jwt.sign(
        { user: userData }, // Only include necessary user data in token
        JwtSecretKey,
        { expiresIn: "24hr" },
        (err, token) => {
          if (err) {
            return res.status(500).json({ error: "Error generating token" });
          }
          res.json({
            token: token,
            user: userData, // Send formatted user data
          });
        }
      );
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
      return next(err);
    }
  },
];

exports.checkAuthPost = [
  verifyToken,
  async (req, res) => {
    jwt.verify(req.token, JwtSecretKey, async (err, authData) => {
      if (err) {
        return res.sendStatus(403);
      }

      try {
        // Fetch fresh user data from database
        const user = await User.findById(authData.user._id);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          message: "logged in...",
          user: formatUserData(user), // Send formatted user data
        });
      } catch (err) {
        res.status(500).json({ error: "Error fetching user data" });
      }
    });
  },
];

// Verify Token
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = exports;
