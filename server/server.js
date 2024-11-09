require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

// CORS options
var corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.post("/api", (req, res) => {
  res.json({ users: ["firstUser", "secondUser"] });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
