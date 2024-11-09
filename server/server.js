require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const frontendUrl = process.env.FRONTEND_URL;

// CORS options
var corsOptions = {
  origin: frontendUrl,
};
app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  res.json({ users: ["firstUser", "secondUser"] });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
