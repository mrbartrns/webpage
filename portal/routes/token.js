// request token api
// const {reissueToken} = require('../middleware/token');
const { User } = require("../models/user");
require("dotenv").config();

module.exports = (app) => {
  // 토큰이만료되면 토큰을 새생성
  // request token api
  app.get("/token", (req, res) => {
    let refreshToken = req.cookies.r_auth;
    // console.log(refreshToken);
    // if not token, then do
    console.log("token을 재발급 하는 라우트입니다.");
    User.findByToken(refreshToken, process.env.REFRESH_SECRET_CODE)
      .then((user) => {
        console.log(user, !user);
        console.log("token을 찾았습니다.");
        if (!user) {
          console.log("user가 없습니다.");
          res.json({ success: false, msg: "유저가 없습니다." });
        }
        return user;
      })
      .then((user) => user.generateToken())
      .then((user) => {
        // console.log(user);
        console.log("token을 재발급 합니다.");
        res
          .cookie(process.env.ACCESS_TOKEN_NAME, user.token, {
            maxAge: 1000 * 60 * 60,
          })
          // .cookie(process.env.REFRESH_TOKEN_NAME, user.refreshToken, {
          //     maxAge: 1000 * 60 * 60 * 24 * 7,
          //     httpOnly: true
          // })
          .status(200)
          .json({
            success: true,
            token: user.token,
          });
      })
      .catch((err) => {
        console.error;
      });
  });
};
