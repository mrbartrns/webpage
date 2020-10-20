// auth.js는 로그아웃 회원정보 수정 및 여러 요소에 인증을 위한 middleware로 사용이 된다.

const {User} = require('../models/user');
const {TokenBlackList} = require('../models/token');

let auth = (req, res, next) => {
    let token = req.cookies.x_auth;

    TokenBlackList.isExpired(token)
        .then(isExpired => {
            if (isExpired) {
                return res.json({isAuth: false, message: 'token already has been expired'});
            } else {
                User.findByToken(token)
                    .then(user => {
                        if (!user) return res.json({isAuth: false, error: true});

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
                        throw err;
                    })
            }
        })
    
}

module.exports = { auth };