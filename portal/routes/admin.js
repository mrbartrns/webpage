const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { Board } = require('../models/boardname');

module.exports = (app, User) => {
    // admin임을 확인하기 위하여 token의 서명, token의 role, token의 id와 로그인된 id을 확인한다.
    app.get('/admin', auth, admin, (req, res) => {
        res.render('admin');
    });

    app.get('/admin/manageusers', auth, admin, (req, res) => {
        User.find()
            .then(users => res.render('admin_user', {users: users}))
            .catch(err => res.json({success: false, err}));
    });

    app.get('/admin/manageboards', auth, admin, (req, res) => {
        Board.find()
        .then(boards => res.status(200).json(boards))
        .catch(err => res.json({success: false, err}));
    });
}
