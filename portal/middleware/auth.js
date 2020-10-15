// auth.js는 로그아웃 회원정보 수정 및 여러 요소에 인증을 위한 middleware로 사용이 된다.

const {User} = require('../models/user');
const {TokenBlackList} = require('../models/token');

let auth = (req, res, next) => {
    let token = req.cookies.x_auth;

    User.findByToken(token)
        .then(user => {
            if (!user) return res.json({isAuth: false, error: true});
            // request 객체에 token과 user 정보를 넘겨준다.
            req.token = token;
            req.user = user;

            // 미들웨어 함수에서 다음으로 진행하기 위해서는 next가 필요
            next();
        })
        .catch(err => {
            throw err;
        })
}

module.exports = {auth};