const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JwtSecretKey = process.env.JWT_SECRET_KEY;

exports.signupPost = [
  async (req, res, next) => {
    console.log("Tried signing up");
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        console.log("unable to hash");
      }
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(404).json({
          error:
            "This email address is already associated with an account. Try a different email or try to login.",
          isUser: true,
        });
      }
      try {
        const user = new User({
          email: req.body.email,
          username: req.body.username,
          password: hashedPassword,
          accountSetup: false,
          videos: [],
        });

        const result = await user.save();
        res.sendStatus(201);
      } catch (err) {
        res.sendStatus(500);
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
            "The crednetials you entered were incorrect. Try a different email/password or sign up.",
        });
      }

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        return res.status(404).json({
          error:
            "The crednetials you entered were incorrect. Try a different email/password or sign up.",
        });
      }

      jwt.sign(
        { user: user },
        JwtSecretKey,
        { expiresIn: "5m" },
        (err, token) => {
          res.json({
            token: token,
            userData: user,
          });
        }
      );
    } catch (err) {
      return next(err);
    }
  },
];

exports.checkAuthPost = [
  verifyToken,
  (req, res) => {
    jwt.verify(req.token, JwtSecretKey, (err, userData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        res.json({
          message: "logged in...",
          userData,
        });
      }
    });
  },
];

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}
