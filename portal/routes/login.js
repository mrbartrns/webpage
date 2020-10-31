const crypto = require("crypto");
const { User } = require("../models/user");
const { login } = require("../middleware/islogin");

module.exports = (app) => {
  // register route
  app.get("/register", (req, res) => {
    res.render("register", { title: "회원가입 하기" });
  });

  // register new user
  app.post("/register", (req, res) => {
    const user = new User();
    user.id = req.body.id;
    user.pw = req.body.pw;
    user.email = req.body.email;
    user.nickName = req.body.nickname;
    crypto.randomBytes(64, (err, buf) => {
      if (err) console.error;
      user.salt = buf.toString("base64");
      // save returns Promise object (resolve userinfo)
      user
        .save()
        .then((_) => res.status(200).json({ success: true }))
        .catch((err) => res.json({ success: false, err }));
    });
  });

  // login route
  app.get("/login", login, (req, res) => {
    if (req.isLogined) {
      return res.json({ success: false, msg: "이미 로그인 되었습니다." });
    }
    res.render("login", { title: "로그인" });
  });

  // inspect valid value when login
  app.post("/login", (req, res) => {
    User.findOne({ id: req.body.id })
      .then((user) => {
        if (!user) res.json({ success: false, msg: "존재하지 않는 ID" });
        user
          .comparePassword(req.body.pw)
          .then((isMatch) => {
            if (!isMatch) {
              return res.json({
                loginSuccess: false,
                msg: "비밀번호가 일치하지 않습니다.",
              });
            }
            return user.generateToken(true);
          })
          .then((user) => {
            console.log("got this step");
            // 여기서 따로 maxAge를 설정해주는 이유는, token은 cookie로 저장되기 때문
            res
              .cookie(process.env.ACCESS_TOKEN_NAME, user.token, {
                maxAge: 1000 * 60 * 60,
              })
              .cookie(process.env.REFRESH_TOKEN_NAME, user.refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
              })
              .status(200)
              // .json({
              //   loginSuccess: true,
              //   token: user.token,
              // });
              .redirect("/");
          });
      })
      .catch((err) => {
        console.error(err);
        res.json({ loginSuccess: false, err });
      });
    // user is this document

    // models/user.js에 작성된 method는 User가 아닌 Document에서 사용되는 객체임
  });
};
