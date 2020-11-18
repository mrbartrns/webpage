const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

const { Test, Sample } = require("./models/test");
const { Counter } = require("./models/post");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(
  process.env.MONGO_URL,
  { dbName: process.env.MONGO_DB },
  (err) => {
    if (err) console.error;
    console.log("mongodb server connected");
  }
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const counter = new Counter();
counter.order = 0;
counter.save();

// set the secret key variable for jwt

// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// app.get("/", (req, res) => {
//   res.json({ success: true });
// });

// app.post("/post", (req, res) => {
//   const test = new Test();
//   test.testString = req.body.string;

//   test
//     .save()
//     .then(() => {
//       res.json({ success: true });
//     })
//     .catch((err) => {
//       res.json({ success: false, err: err });
//     });
// });

// app.listen(3000, () => {
//   console.log("server connected");
// });
