const crypto = require('crypto');

module.exports = (app, User) => {
    // register route
    app.get('/register', (req, res) => {
        res.render('register');
    });

    // register new user
    app.post('/register', (req, res) => {
        const user = new User();
        user.id = req.body.id;
        user.pw = req.body.pw;
        user.email = req.body.email;
        user.nickName = req.body.nickname;
        crypto.randomBytes(64, (err, buf) => {
            if (err) console.error;
            user.salt = buf.toString('base64');
            // save returns Promise object (resolve userinfo)
            user
                .save()
                .then(_ => res.status(200).json({success: true}))
                .catch(err => res.json({success: false, err}));
        });
    });

    // login route
    app.get('/login', (req, res) => {
        res.render('login');
    });

    // inspect valid value when login
    app.post('/login', (req, res) => {
        User
            .findOne({id: req.body.id})
            .then(user => {
                if (!user) res.json({success: false, message:'존재하지 않는 ID'})
                user
                    .comparePassword(req.body.pw)
                    .then(isMatch => {
                        if(!isMatch) {
                            return res.json({
                                loginSuccess: false,
                                message: '비밀번호가 일치하지 않습니다.'
                            });
                        }
                        user
                            .generateToken()
                            .then(user => {
                                console.log('got this step')
                                res
                                    .cookie("x_auth", user.token)
                                    .status(200)
                                    .json({
                                    loginSuccess: true,
                                    token: user.token
                                    });
                            })
                    })
            })
            .catch(err => {
                console.error(err);
                res.json({loginSuccess: false, err})
            })
            // user is this document

            // models/user.js에 작성된 method는 User가 아닌 Document에서 사용되는 객체임
            

    });
}