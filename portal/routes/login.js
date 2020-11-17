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

    // 유저마다 랜덤 salt를 생성한다.
    crypto.randomBytes(64, (err, buf) => {
      if (err) console.error;
      user.salt = buf.toString("base64");
      // save returns Promise object (resolve userinfo)
      user
        .save()
        .then(() => {
          console.log("register done");
          res.json({ success: true });
        })
        .catch((err) => res.json({ success: false, msg: err }));
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
                // maxAge: 1000 * 10, // test
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

  // todo: validation data 함수로 변경하기
  app.post("/validate-id", (req, res) => {
    let idFlag, idMsg;

    const id = req.body.value;
    // id 검증
    if (id.length < 6 || id.length > 20) {
      console.log("id검증");
      idFlag = false;
      idMsg = "id는 6글자 이상, 20글자 이하여야 합니다.";
      res.json({ flag: idFlag, msg: idMsg });
    } else {
      User.findOne({ id: id })
        .then((user) => {
          if (!user) {
            idFlag = true;
            idMsg = "사용할 수 있는 id입니다.";
          } else {
            idFlag = false;
            idMsg = "이미 사용중인 id입니다.";
          }
          res.json({ flag: idFlag, msg: idMsg });
        })
        .catch((err) => console.error(err));
    }
  });

  app.post("/validate-email", (req, res) => {
    let emailFlag, emailMsg;
    const emailRegEx = /\w+@\w+\.\w+/;
    const email = req.body.value;
    // email 검증
    console.log(email);
    console.log(email.match(emailRegEx));
    if (!email.match(emailRegEx)) {
      console.log("이메일 형식");
      emailFlag = false;
      emailMsg = "email 형식과 맞지 않습니다.";
      res.json({ flag: emailFlag, msg: emailMsg });
    } else {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            console.log("사용가능 email");
            emailFlag = true;
            emailMsg = "사용할 수 있는 email입니다.";
          } else {
            console.log("사용중인 email");
            emailFlag = false;
            emailMsg = "이미 사용중인 email입니다.";
          }
          res.json({ flag: emailFlag, msg: emailMsg });
        })
        .catch((err) => console.error(err));
    }
  });

  app.post("/validate-pw", (req, res) => {
    let pwFlag, pwMsg;
    const pw = req.body.value;
    console.log(pw);
    if (pw.length < 8) {
      pwFlag = false;
      pwMsg = "비밀번호는 8자리 이상이어야 합니다.";
    } else {
      pwFlag = true;
      pwMsg = "비밀번호가 조건을 충족합니다.";
    }
    res.json({ flag: pwFlag, msg: pwMsg });
  });

  app.post("/validate-nickname", (req, res) => {
    let nickNameFlag, nickNameMsg;
    const nickName = req.body.value;
    if (nickName.length < 2) {
      nickNameFlag = false;
      nickNameMsg = "닉네임은 최소 2글자 이상이여야 합니다.";
      res.json({ flag: nickNameFlag, msg: nickNameMsg });
    } else {
      User.findOne({ nickName: nickName }).then((user) => {
        if (!user) {
          nickNameFlag = true;
          nickNameMsg = "사용할 수 있는 닉네임입니다.";
        } else {
          nickNameFlag = false;
          nickNameMsg = "이미 사용중인 닉네임입니다.";
        }
        res.json({ flag: nickNameFlag, msg: nickNameMsg });
      });
    }
  });
};
