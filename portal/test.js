const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
  console.log(req.query.name);
  console.log(req.query.string);
  res.json({ name: req.query.name, string: req.query.string });
});
// view engine setup

app.listen(3000, () => {
  console.log("server listen on 3000");
});
