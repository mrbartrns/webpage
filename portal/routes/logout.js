const {auth} = require('../middleware/auth');

module.exports = (app, User, TokenBlackList) => {
    app.get('/logout', auth, (req, res) => {
        const token = req.token;
        const tokenBlackList = new TokenBlackList();
        tokenBlackList.token = token;
        User.findOneAndUpdate({_id: req.user._id}, {token: ""})
            .then(() => {
                tokenBlackList.save()
                    .then(() => {
                        res.clearCookie('x_auth');
                        res.json({success: true})
                    });
            })
            .catch((err) => res.json({success: false, err}));
    });
}