require("dotenv").config();
const express = require("express");
const app = express();
const RateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const usersRoutes = require("./routes/usersRoutes");

// CORS options
var corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Set up rate limiter: maximum of twenty requests per minute
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // requests per minute
  validate: { xForwardedForHeader: false },
});

app.use(limiter); // Apply rate limiter to all requests

// apply options for body parser and express
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// connect to mongoDB
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URL;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Routes
app.use("/users", usersRoutes);

app.post("/api", (req, res) => {
  res.json({ users: ["firstUser", "secondUser"] });
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});
