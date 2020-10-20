const { auth } = require('../middleware/auth');
const { views } = require('../middleware/viewCount');
const { Board } = require("../models/boardname");
const { Post } = require('../models/post');
const { User } = require('../models/user');

module.exports = (app) => {
    app.get('/board/:boardurl', async (req, res) => {
        // board 전부를 표시하여
        const [boards, board] = await Promise.all([Board.find(), Board.findOne({url: req.params.boardurl})]);
        Post.find({_board: board._id})
            .populate({
                path: '_board',
                model: 'boards'
            })
            .populate({
                path: '_user',
                model: 'users'
            })
            .sort({regDate: -1})
            .exec()
            .then(posts => {
                res.render('board_main', {
                    board: board,
                    boards: boards,
                    posts: posts
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

    app.post('/board/:boardurl/post', auth, async (req, res) => {
        const post = new Post();
        post.title = req.body.title;
        post.contents = req.body.contents;
        
        // user 정보를 objectId로 저장
        post._user = req.user._id;
        
        // legacy
        // post.id = req.user.id;
        // post.nickName = await User.findOne({id: post.id});

        // Date를 여기서 선언해야지만 계속 변한다.
        post.regDate = Date.now();

        // post id를 UserDB에 저장
        User
            .findOneAndUpdate({_id: req.user._id}, {myArticle: post._id});

        
        Board
            .findOne({url: req.params.boardurl})
            .then(board => {
                if(!board) res.json({success: false, err});
                post._board = board._id;
            })
            .then(() => {
                post
                .save()
                .then(post =>{
                    if(!post) res.json({success: false, message:'error'});
                    res.status(200).json({success: true});
                })
                .catch(err => {
                    res.json({success: false, err});
                })
            })
            .catch(err => {
                res.json({Success: false, err});
            })
    });


    // 수정 필요, populate가 안됨 => populate는 DB단에서 합쳐주는 것이 아닌, 자바스크립트 단에서 합치는것으로 성능이 나쁘다.
    // views는 같은 홈페이지에서 refresh했을때 증가하지 않아야 한다. > middleware로 작성?
    // 글의 작성자가 본인일 경우, 수정과 삭제를 할 수 있고 그렇지 않은경우에는 수정과 삭제를 할 수 없다.
    /**
     * 글 작성자가 본인임을 확인하는 방법: 쿠키사용. 쿠키값의 토큰과 User의 토큰을 확인한다. 맞다면 true, 틀리면 false를 보낸다.
     * 
     */

    app.get('/board/:boardurl/:postid', views, (req, res) => {
        
        // x_auth is name of Cookie
        let token = req.cookies.x_auth;
        Post
            .findOne({_id: req.params.postid})
            .populate({
                path: '_board',
                model: 'boards'
            })
            .populate({
                path: '_user',
                model: 'users'
            })
            .then(post => {
                let token = req.cookies.x_auth;
                post
                    .authorizeUser(token)
                    .then(isAuthorized => {
                        res.render('board_article', {post: post, isMe: isAuthorized})
                    });
            });
            // .catch(err => res.json({success: false, err}));
    });
}