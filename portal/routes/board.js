const { auth } = require('../middleware/auth');
const { view } = require('../middleware/viewCount');
const { Board } = require("../models/boardname");
const { Post } = require('../models/post');
const { User } = require('../models/user');
const { Comment } = require('../models/comment');

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
                    posts: posts,
                    title: `${board.boardName} - Portal`
                });
            });
    });

    app.get('/board/:boardurl/post', auth, (req, res) => {
        Board
            .findOne({url: req.params.boardurl})
            .then(board => {
                res.render('board_post', {board: board, title: board.boardName});
            })
            .catch(err => res.json({success: false, err}));
    });

    app.post('/board/:boardurl/post', auth, (req, res) => {
        // console.log(req.body);
        const post = new Post();
        post.title = req.body.title;
        post.contents = req.body.contents;
        
        // // user 정보를 objectId로 저장
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
            .then(_ => post.save())
            .then(post =>{
                if(!post) res.json({success: false, message:'error'});
                // res.status(200).json({success: true});
                res.redirect(`/board/${req.params.boardurl}`)
            })
            .catch(err => {
                res.json({success: false, err});
            })
    });


    // 수정 필요, populate가 안됨 => populate는 DB단에서 합쳐주는 것이 아닌, 자바스크립트 단에서 합치는것으로 성능이 나쁘다.
    // views는 같은 홈페이지에서 refresh했을때 증가하지 않아야 한다. > middleware로 작성?
    // 글의 작성자가 본인일 경우, 수정과 삭제를 할 수 있고 그렇지 않은경우에는 수정과 삭제를 할 수 없다.
    /**
     * 글 작성자가 본인임을 확인하는 방법: 쿠키사용. 쿠키값의 토큰과 User의 토큰을 확인한다. 맞다면 true, 틀리면 false를 보낸다.
     * 
     */

    app.get('/board/:boardurl/:postid', view, (req, res) => {
        
        let token = req.cookies.x_auth;
        let isLogined = token ? true : false;

        // x_auth is name of Cookie
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
            .populate({
                path: 'comments',
                model: 'comments',
                populate: [{
                    path: '_user',
                    model: 'users'
                }]
            })
            .then(post => {
                console.log(post.comments[0]);
                
                // get routes에서는 로그인만 확인하고, post routes에서는 auth까지 같이 확인
                
                post
                    .authorizeUser(token)
                    .then(isAuthorized => {

                        // isMe is used for verify post's writer
                        res.render('board_article', {
                            post: post, 
                            isMe: isAuthorized, 
                            isLogined: isLogined, 
                            token: token,
                            title:`${post._board.boardName} - Portal`})
                    })
                    
            })
            .catch(err => {
                console.error(err);
                res.json({success: false, err});
            });
    });

    app.post('/board/:postid/like', auth, (req, res) => {
        /**
         * 로그인 되어있는 user를 찾는다.
         * like는 post당 하나의 like만 할 수 있다.
         * if user의 postid가 없다면, like를 증가 후 postid를 추가한다.
         * postid가 있다면, like를 깎은 후 postid를 제거한다.
         */
        let likeFlag;
        let likesCount;
        User
            .findOne({token: req.token})
            .then(user => {
                console.log('phase 1')
                if(user.myLikes.indexOf(req.params.postid) !== -1) {

                    const index = user.myLikes.indexOf(req.params.postid);

                    user.myLikes.splice(index, 1);
                    user.save()

                    likeFlag = false;
                } else {
                    user.myLikes.push(req.params.postid);

                    // can rewrite mutable data
                    user.save()
                    likeFlag = true;
                }
            })
            .catch(err => console.error(err));
        Post
            .findById(req.params.postid)
            .then(post => {
                console.log('phase 2');
                likesCount = post.likes;
                console.log(likesCount);
                console.log(likeFlag);
                if (likeFlag) {
                    likesCount++;
                    console.log(likesCount);
                } else {
                    likesCount--;
                    console.log(likesCount);
                }

                post.likes = likesCount;
                console.log('after like:', post);
                // not working+
                post.save()
                    .then(post => res.json(post.likes))
            })
            .catch(err => console.error(err));
        
    });

    // post에 comment를 단다. comment에 comment를 달 때에는? // 
    app.post('/board/:boardurl/:postid/comment/post', auth, (req, res) => {
        const comment = new Comment();
        comment._post = req.params.postid;
        comment._user = req.user._id;
        comment.contents = req.body.comment;
        comment.regDate = Date.now();

        // save comment on db
        comment
            .save()
            .catch(err => {
                console.error(err);
                res.json({success: false, err});
            });
        
        // save comment id on post
        Post
            .findOne({_id: req.params.postid})
            .then(post => {
                if (!post) console.error('post not found');
                post.comments.push(comment._id);
                post.save()
            })
            .then(_ => console.log('post save done'))
            .catch(err=> console.error(err));

        User.findOne({_id: req.user._id})
            .then(user => {
                if (!user) console.error('user not found');
                console.log('user found');
                user.myComments.push(comment._id);
                user.save();
            })
            .then(_ => {
                console.log('user save done');
                res.redirect(`/board/${req.params.boardurl}/${req.params.postid}`);
            })
            .catch(err => {
                console.error(err);
                res.json({success: false, err});
            })
    });
}