const express = require("express");
const app = express();
const cors = require("cors");

// CORS options
var corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  res.json({ users: ["firstUser", "secondUser"] });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
