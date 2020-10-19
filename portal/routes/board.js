const { auth } = require('../middleware/auth');
const { Board } = require("../models/boardname");
const { Post } = require('../models/post');

module.exports = (app) => {
    app.get('/board/:boardurl', (req, res) => {
        // board 전부를 표시하여
        Board
            .findOne({url: req.params.boardurl})
            .then(board => {
                Board
                    .find()
                    .then(boards => {
                        Post
                            .find({board_id: board._id})
                            .then(posts => {
                                res.render('board_main', {
                                    board: board, 
                                    boards: boards,
                                    posts: posts
                                });
                                // res.status(200).json(posts)
                            })
                            .catch(err => {
                                res.json({success: false, err});
                            });
                    });
            });
    });

    app.get('/board/:boardurl/post', auth, (req, res) => {
        Board
            .findOne({url: req.params.boardurl})
            .then(board => {
                res.render('board_post', {board: board});
            })
            .catch(err => res.json({success: false, err}));
    });

    app.post('/board/:boardurl/post', auth, (req, res) => {
        const post = new Post();
        post.title = req.body.title;
        post.contents = req.body.contents;
        post.nickName = req.user.nickName;
        post.id = req.user.id;
        Board
            .findOne({url: req.params.boardurl})
            .then(board => {
                if(!board) res.json({success: false, err});
                post.board_id = board._id;
            })
            .then(() => {
                post
                .save()
                .then(post =>{
                    if(!post) res.json({success: false, message:'error'});
                    res.status(200).json({success: true});
                })
                // .catch(err => {
                //     res.json({success: false, err});
                // })
            })
            .catch(err => {
                res.json({Success: false, err});
            })
    });

    app.get('/board/:boardurl/:postid', (req, res) => {
        Post
            .findOne({_id: req.params.postid})
            .populate('board_id')
            .then(post => {
                post.views++;
            })
            .then((post) => {
                post
                    .save()
                    .then(post => {
                        console.log(post);
                        res.render('board_article', {post: post});
                    })
            })
    });
}