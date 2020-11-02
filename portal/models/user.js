const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// const secretCode = require('../config').secret;
require("dotenv").config();

// User Schema 만들기
const Schema = mongoose.Schema;

// id, pw, salt, email, nickname, role, token, tokenExp
// email has to be inspected before save
const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: 1,
    minlength: 6,
    maxlength: 20,
  },

  pw: {
    type: String,
    required: true,
    trim: true,
  },

  salt: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    trim: true,
    required: true,
    match: /\w+@\w+.\w+/,
    unique: 1,
  },

  nickName: {
    type: String,
    required: true,
    unique: 1,
  },

  role: {
    type: Number,
    required: true,
    default: 0,
  },

  // user image
  img: {
    type: String,
  },

  // this is accessToken
  token: {
    type: String,
  },

  // this is refreshToken
  refreshToken: {
    type: String,
  },

  tokenExp: {
    type: Number,
  },

  recentlyAccessed: {
    type: Date,
  },

  myArticles: [
    {
      type: Schema.Types.ObjectId,
      ref: "posts",
      index: true,
    },
  ],

  myComments: [
    {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
  ],

  myLikes: [
    {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
  ],

  recentAccess: {
    type: Date,
  },

  banned: {
    type: Boolean,
    required: true,
    default: false,
  },

  bannedExp: {
    type: Date,
  },
});

// crypt password before save
userSchema.pre("save", function (next) {
  let user = this;
  if (user.isModified("pw")) {
    let plainPassword = user.pw;
    user.pw = crypto
      .pbkdf2Sync(plainPassword, user.salt, 100000, 64, "sha512")
      .toString("base64");
    next();
  } else {
    next();
  }
});

userSchema.pre("deleteOne", { document: true }, function () {
  let user = this;
  user.model("posts").deleteMany({ _user: { $in: user._id } });
  user.modle("comments").deleteMany({ _user: { $in: user._id } });
});

userSchema.methods.comparePassword = function (plainPassword) {
  // 여기서 this는 Router 상의 Document가 된다 => Promise 객체를 반환하여 비동기적으로 사용
  return new Promise((resolve, reject) => {
    let isMatch;
    const cryptedPw = crypto
      .pbkdf2Sync(plainPassword, this.salt, 100000, 64, "sha512")
      .toString("base64");
    isMatch = this.pw === cryptedPw;
    resolve(isMatch);
  });
};

/*
userSchema.methods.generateToken = function() {
    let user = this;
    // _id를 이용해서 토큰으로 만든다.
    const token = jwt.sign({
        _id: user._id,
        id: user.id,
        role: user.role
    }, secretCode, {
        expiresIn: '1h',
        issuer: 'testissuer.com',
        subject: 'userInfo'
    });
    // const token = jwt.sign(this._id.toHexString(),"secret token");

    this.token = token;

    return this.save()
        .then(user => user)
        .catch(err => err);
}
*/

// 로그인시 기존의 refresh token을 blacklist에 추가 > 구현법?
// token이 재발급 될 때 접속시간 갱신
userSchema.methods.generateToken = function (init = false) {
  let user = this; // user: document
  const accessToken = jwt.sign(
    {
      _id: user._id,
      id: user.id,
      role: user.role,
    },
    process.env.ACCESS_SECRET_CODE,
    {
      expiresIn: "1h",
      issuer: "testissuer.com",
      subject: "userInfo",
    }
  );

  if (init) {
    console.log("refresh 토큰 저장");
    const refreshToken = jwt.sign(
      {
        _id: user._id,
        id: user.id,
        role: user.role,
      },
      process.env.REFRESH_SECRET_CODE,
      {
        expiresIn: "7d",
        issuer: "testissuer.com",
        subject: "userInfo",
      }
    );
    user.refreshToken = refreshToken;
  }

  user.token = accessToken;

  // todo: separate
  user.recentlyAccessed = Date.now();

  console.log("token을 재생성 했습니다.");

  return user
    .save()
    .then((user) => user)
    .catch((err) => err);
};

// access token을 이용하여 항상 작업 수행
// 토큰을 찾아서 작업을 수행 (회원정보 수정, 로그인권한 확인) 전에 필요한 중간 미들웨어
userSchema.statics.findByToken = function (token, code) {
  // user = Collection
  let user = this;

  // secret token을 통해 user의 id 값을 받아오고, 해당 아이디를 통해 db에 접근, 유저 정보를 가져옴
  // token을 decode 할 때 자동으로 유효성 검사를 하므로, 따로 할 필요는 없다.
  // but token이 expired 됐을 때, 오류가 나지 않게 처리해주는 함수 필요
  return jwt.verify(token, code, (err, decoded) => {
    if (err) console.error;
    // console.log({ decoded_info: decoded });

    if (!decoded) {
      console.log(`decoded가 없습니다.`);
      return new Promise((resolve, reject) => {
        resolve(null);
      });
    }
    return user
      .findOne({ _id: decoded._id })
      .then((user) => user) // 유저 정보를 가져옴
      .catch((err) => err);
  });
};

// methods는 Document 단위로 사용하는 함수이고
// statics는 Collection 단위로 사용하는 함수이다.

const User = mongoose.model("users", userSchema);

module.exports = { User };
