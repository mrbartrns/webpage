const { auth } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { Board } = require('../models/boardname');

module.exports = (app, User) => {
    // admin임을 확인하기 위하여 token의 서명, token의 role, token의 id와 로그인된 id을 확인한다.
    app.get('/admin', auth, admin, (req, res) => {
        res.render('admin_main');
    });

    // MANAGE USER
    app.get('/admin/manageusers', auth, admin, (req, res) => {
        User.find()
            .then(users => res.render('admin_user', {users: users}))
            .catch(err => res.json({success: false, err}));
    });

    app.post('/admin/manageusers/modify/user/:id', auth, admin, (req, res) =>{
        console.log(req.body);
        // {id: req.params.id};
        User.findOneAndUpdate({_id: req.params.id}, {role: Number(req.body.role)})
            .then(user => {
                if (!user) {
                    return res.json({success: false, message: 'no user found'})
                }
                res.status(200).redirect('/admin/manageusers');
            })
            .catch(err => res.json({success: false, err}));
    });

    app.get('/admin/manageusers/modify/:_id', auth, admin, (req, res) => {
        console.log(req.params._id);
        User
            .findOne({_id: req.params._id})
            .then(user => {
                res.status(200).render('admin_moduser', {user: user});
                // res.status(200).json({success: true});
            })
            .catch(err => {
                res.json({success: false, err});
            })
    });


    // MANAGE BOARDS
    app.get('/admin/manageboards', auth, admin, (req, res) => {
        Board.find()
        .then(boards => res.render('admin_boards', {boards: boards}))
        .catch(err => res.json({success: false, err}));
    });

    app.get('/admin/manageboards/register', auth, admin, (req, res) => {
        res.render('admin_board_register');
    });

    app.post('/admin/manageboards/register', auth, admin, (req, res) => {
        const board = new Board();
        board.boardName = req.body.boardname;
        board.url = req.body.url;
        board
            .save()
            .then(board => {
                res.redirect('/admin/manageboards/');
            })
            .catch(err => {
                res.json({success: false, err});
            });
    });

    app.delete('/admin/manageboards/delete/:url', auth, admin, (req, res) => {
        Board.findOneAndDelete({url: req.params.url})
            .then(board => {
                // res.json({success: true});
                console.log('success');
                res.json({success: true});
            })
            .catch(err => {
                res.json({success: false, err});
            });
    });

    app.get('/admin/manageboards/edit/:url', auth, admin, (req, res) => {
        Board
            .findOne({url: req.params.url})
            .then(board => {
                res.render('admin_board_edit', {board: board});
            });
    });

    app.post('/admin/manageboards/edit/:url', auth, admin, (req, res) => {
        Board
            .findOneAndUpdate({url: req.params.url}, {boardName: req.body.boardname, url: req.body.url})
            .then(board => {
                res.redirect('/admin/manageboards');
            })
            .catch(err => {
                res.json({success: false, err});
            })
    });
}
