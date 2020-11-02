// auth.js는 로그아웃 회원정보 수정 및 여러 요소에 인증을 위한 middleware로 사용이 된다.

const { User } = require("../models/user");
const { Post } = require("../models/post");
require("dotenv").config();

// const {TokenBlackList} = require('../models/token');

/*
let auth = (req, res, next) => {
    let token = req.cookies.x_auth;
    
    TokenBlackList
        .isExpired(token)
        .then(isExpired => {
            if (isExpired) {
                return res.json({isAuth: false, message: 'token already has been expired'});
            } else {
                User
                    .findByToken(token)
                    .then(user => {
                        if (!user) return res.json({isAuth: false, err});

                        req.token = token;
                        req.user = {
                            _id: user._id,
                            id: user.id,
                            nickName: user.nickName,
                            role: user.role
                        };

                        next();
                    })
                    .catch(err => {
                        res.json({isAuth: false, err})
                    })
            }
        })
    
}
*/

// let auth = (req, res, next) => {
//     let token = req.cookies.x_auth;

//     User
//         .findByToken(token, process.env.ACCESS_SECRET_CODE)
//         .then(user => {
//             if (!user) return res.json({isAuth: false});

//             req.token = token;
//             req.user = {
//                 _id: user._id,
//                 id: user.id,
//                 nickName: user.nickName,
//                 role: user.role
//             };

//             next();
//         })
//         .catch(err => {
//             res.json({isAuth: false, message: 'token has been expired.', err})
//         })
// }

let auth = (req, res, next) => {
  console.log("auth 미들웨어");
  console.log("로그인 여부:", req.isLogined);
  if (!req.isLogined) {
    console.log("권한이 없습니다.");
    return res.json({ isAuth: false, msg: "권한이 없습니다." });
  }
  next();
};

module.exports = { auth };
