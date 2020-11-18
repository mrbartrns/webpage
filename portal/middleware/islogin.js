const { User } = require("../models/user");
require("dotenv").config();

// global middleware 설정 예정
let login = (req, res, next) => {
  let token = req.cookies.x_auth;
  console.log("login미들웨어로 들어왔습니다.");
  if (!token) {
    console.log("token이 없습니다.");
    req.isLogined = false;
    next();
  } else {
    // token 검증
    console.log("token이 있습니다.");
    User.findByToken(token, process.env.ACCESS_SECRET_CODE).then((user) => {
      if (!user) {
        // 토큰이 만료되었을 때에도 이 경우로 들어감.
        console.log("user가 없습니다.");
        req.isLogined = false;
      } else {
        console.log("user를 찾았습니다.");
        req.isLogined = true;
        req.token = token;
        req.user = {
          _id: user._id,
          id: user.id,
          nickName: user.nickName,
          role: user.role,
          banned: user.banned,
        };
      }
      // next가 then 안에 있어야 req가 저장된 후 next 함수가 호출됨!
      next();
    });
  }
};

module.exports = { login };
