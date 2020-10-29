// request token api
// const {reissueToken} = require('../middleware/token');
const { User } = require('../models/user');
require('dotenv').config();

// 토큰이 만료되면 토큰을 재생성 => 현재는 access, refresh 모두 갱신함
module.exports = (app) => {
    // request token api
    app.get('/token', (req, res) => {
        let refreshToken = req.cookies.r_auth;
        console.log(refreshToken);
        User
            .findByToken(refreshToken, process.env.REFRESH_SECRET_CODE)
            .then(user => {
                console.log('token을 찾았습니다.');
                if (!user) res.json({success: false, message: '유저가 없습니다.'});
                return user
            })
            .then(user => user.generateToken())
            .then(user => {
                console.log(user);
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
                        token: user.token
                    });
            })
            .catch(err => {
                console.error;
            })
    })
}