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
                            .find({boardId: board._id})
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
}