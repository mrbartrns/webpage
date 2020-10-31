// auth middleware: 로그인이 되어 있다면,
const { auth } = require("../middleware/auth");
const { view } = require("../middleware/viewCount");
const { Board } = require("../models/boardname");
const { Post } = require("../models/post");
const { User } = require("../models/user");
const { Comment } = require("../models/comment");

module.exports = (app) => {
  // 게시판 글 목록 route
  app.get("/board/:boardurl", async (req, res) => {
    const [boards, board] = await Promise.all([
      Board.find(),
      Board.findOne({ url: req.params.boardurl }),
    ]);
    Post.find({ _board: board._id })
      .populate({
        path: "_board",
        model: "boards",
      })
      .populate({
        path: "_user",
        model: "users",
      })
      .sort({ regDate: -1 })
      .exec()
      .then((posts) => {
        res.render("board_main", {
          board: board,
          boards: boards,
          posts: posts,
          title: `${board.boardName} - Portal`,
        });
      });
  });

  // 글쓰기 route
  app.get("/board/:boardurl/post", auth, (req, res) => {
    Board.findOne({ url: req.params.boardurl })
      .then((board) => {
        res.render("board_post", { board: board, title: board.boardName });
      })
      .catch((err) => res.json({ success: false, err }));
  });

  // 글쓴 후 post route
  app.post("/board/:boardurl/post", auth, (req, res) => {
    /**
     * make a new post instance (user.)
     * save post._user in post
     * save post._id in user
     * find board._id with url(req.params.url)
     * save post._board in post
     */

    // post 객체를 생성 > 제목, 본문, 글쓴이(req.user._id), 날짜, 수정 날짜를 저장(수정날짜는 자동으로 저장됨)
    const post = new Post();
    post.title = req.body.title;
    post.contents = req.body.contents;
    post._user = req.user._id;
    post.regDate = Date.now();

    // 글쓴이(req.user._id)를 찾아 post._id를 참조할 수 있게 push후 저장
    User.findOne({ _id: req.user._id }).then((user) => {
      user.myArticles.push(post._id);
      user.save();
    });

    // board 객체를 찾은 후, board._id를 post에 _board에 저장
    Board.findOne({ url: req.params.boardurl })
      .then((board) => {
        if (!board) res.json({ success: false, err });
        post._board = board._id;
      })
      .then(() => post.save())
      .then((post) => {
        if (!post) res.json({ success: false, msg: "error" });
        // res.status(200).json({success: true});
        res.redirect(`/board/${req.params.boardurl}`);
      })
      .catch((err) => {
        res.json({ success: false, err });
      });
  });

  // 게시글 본문 route
  app.get("/board/:boardurl/:postid", view, (req, res) => {
    let token = req.token;
    let login = req.isLogined;

    // x_auth is name of Cookie
    Post.findOne({ _id: req.params.postid })
      .populate({
        path: "_board",
        model: "boards",
      })
      .populate({
        path: "_user",
        model: "users",
      })
      .populate({
        path: "comments",
        model: "comments",
        populate: [
          {
            path: "_user",
            model: "users",
          },
        ],
      })
      .then((post) => {
        console.log(post.comments[0]);

        // 본문이 본인이 쓴 글인지 확인한다.
        post.authorizeUser(token).then((isAuthorized) => {
          // isMe is used for verify post's writer
          res.render("board_article", {
            post: post,
            isMe: isAuthorized,
            isLogined: login,
            token: token,
            title: `${post._board.boardName} - Portal`,
          });
        });
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false, err });
      });
  });

  // 게시글 수정 route
  app.get("/board/:boardurl/:postid/edit", auth, (req, res) => {
    const postId = req.params.postid;
    Post.findOne({ _id: postId })
      .populate({
        path: "_board",
        model: "boards",
      })
      .populate({
        path: "_user",
        model: "users",
      })
      .then((post) => {
        if (!post)
          res.json({ success: false, msg: "올바르지 않은 게시판 또는 postId" });

        // auth에서 로그인 여부를 확인하므로 token을 이용해도 괜찮다.
        post.authorizeUser(req.token).then((isAuthorized) => {
          if (!isAuthorized)
            res.json({ success: false, msg: "올바르지 않은 유저" });
          res.render("board_post_edit", {
            board: post._board,
            title: "글 수정하기",
            post: post,
          });
        });
      });
  });

  // 게시글 수정 post
  app.post("/board/:boardurl/:postid/edit", auth, (req, res) => {
    console.log("게시글 수정 route");

    // 바뀐 내용을 post에 저장
    Post.findOne({ _id: req.params.postid })
      .then((post) => {
        post.title = req.body.title;
        post.contents = req.body.contents;
        console.log("save done");
        return post.save();
      })
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.error(err);
      });
  });

  // 게시글 삭제 route
  app.post("/board/:boardurl/:postid/delete", auth, (req, res) => {
    /**
     * 게시글 찾기
     * authorize User
     * delete post and post가 참조되어 있는 모든 collection documents
     */
  });

  // 게시글 LIKE route (like 클릭시 post요청)
  app.post("/board/:postid/like", auth, (req, res) => {
    /**
     * 로그인 되어있는 user를 찾는다.
     * like는 post당 하나의 like만 할 수 있다.
     * if user의 postid가 없다면, like를 증가 후 postid를 추가한다.
     * postid가 있다면, like를 깎은 후 postid를 제거한다.
     */
    console.log("like 라우트에 들어왔습니다");
    let likeFlag;
    let likesCount;
    User.findOne({ token: req.token })
      .then((user) => {
        console.log("phase 1");
        if (user.myLikes.indexOf(req.params.postid) !== -1) {
          const index = user.myLikes.indexOf(req.params.postid);

          user.myLikes.splice(index, 1);
          user.save();

          likeFlag = false;
        } else {
          user.myLikes.push(req.params.postid);

          // can rewrite mutable data
          user.save();
          likeFlag = true;
        }
      })
      .catch((err) => console.error(err));
    Post.findById(req.params.postid)
      .then((post) => {
        console.log("phase 2");
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
        console.log("after like:", post);
        // not working+
        post.save().then((post) => res.json(post.likes));
      })
      .catch((err) => console.error(err));
  });

  // post에 comment를 단다. comment에 comment를 달 때에는? //
  app.post("/board/:boardurl/:postid/comment/post", auth, (req, res) => {
    const comment = new Comment();
    comment._post = req.params.postid;
    comment._user = req.user._id;
    comment.contents = req.body.comment;
    comment.regDate = Date.now();

    // save comment on db
    comment.save().catch((err) => {
      console.error(err);
      res.json({ success: false, err });
    });

    // save comment id on post
    Post.findOne({ _id: req.params.postid })
      .then((post) => {
        if (!post) console.error("post not found");
        post.comments.push(comment._id);
        post.save();
      })
      .then((_) => console.log("post save done"))
      .catch((err) => console.error(err));

    User.findOne({ _id: req.user._id })
      .then((user) => {
        if (!user) console.error("user not found");
        console.log("user found");
        user.myComments.push(comment._id);
        user.save();
      })
      .then((_) => {
        console.log("user save done");
        res.redirect(`/board/${req.params.boardurl}/${req.params.postid}`);
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false, err });
      });
  });
};
