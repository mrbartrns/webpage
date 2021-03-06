const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const { User } = require("./models/user");
const { TokenBlackList } = require("./models/token");
const { Board } = require("./models/boardname");

const { login } = require("./middleware/islogin");

require("dotenv").config();

const app = express();

// database 연결
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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set the secret key variable for jwt
app.set("jwt-secret", config.secret);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(login);

// 로그인 되어있는지 여부를 확인한다.
app.get("/", (req, res) => {
  let isLogined = req.isLogined;
  // 로그인이 되지 않았더라면, undefinde가 뜬다.
  // console.log("로그인 한 유저:", req.user);
  Board.find()
    .then((boards) => {
      res.render("index", {
        title: "portal",
        boards: boards,
        login: isLogined,
        user: req.user ? req.user : null,
      });
    })
    .catch((err) => {
      res.render("error");
    });
});

// related to login, register routes
require("./routes/login")(app);
require("./routes/modify")(app);
require("./routes/logout")(app);
require("./routes/admin")(app);
require("./routes/board")(app);
require("./routes/token")(app);
require("./routes/comment")(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
