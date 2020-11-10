// auth middleware: 로그인이 되어 있다면,
const { auth } = require("../middleware/auth");
const { view } = require("../middleware/viewCount");
const { Board } = require("../models/boardname");
const { Post } = require("../models/post");
const { User } = require("../models/user");
const { Comment } = require("../models/comment");

// mongoose findOne => save형식으로 진행
// 아니면 그냥 쿼리 updateOne > push pull inc set 등등
let orderNumber;
Post.countDocuments()
  .then((number) => {
    orderNumber = number;
    console.log(orderNumber);
  })
  .catch((err) => console.error(err));

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
    post.orderNumber = Number(`${Date.now()}${orderNumber}`);

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
        console.error(err);
        res.json({ success: false, err });
      });

    orderNumber++;
  });

  // 게시글 본문 route
  app.get("/board/:boardurl/:postid", view, (req, res) => {
    let likeFlag;
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
        likeFlag = post.likes.indexOf(req.user._id) !== -1 ? true : false;
        // 본문이 본인이 쓴 글인지 확인한다.
        post.authorizeUser(token).then((isAuthorized) => {
          // isMe is used for verify post's writer
          res.render("board_article", {
            post: post,
            isMe: isAuthorized,
            isLogined: login,
            token: token,
            title: `${post._board.boardName} - Portal`,
            likeFlag: likeFlag,
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
    Post.findOne({ _id: req.params.postid }).then((post) => {
      post
        .deleteOne()
        .then((post) => {
          console.log(post);
          res.json({ success: true, msg: "삭제가 완료되었습니다." });
        })
        .catch((err) => console.log(err));
    });
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
    const user = req.user;
    // Post.updateOne({_id: {$in: req.params.postid}}, {
    //   $push: {}
    // })
    Post.findOne({ _id: req.params.postid })
      .then((post) => {
        console.log("post를 찾았습니다");
        // res.json({ success: true, likes: 1 });
        // const likes = post.likes.map((user) => user.toString());
        // console.log(likes);
        if (post.likes.indexOf(user._id) !== -1) {
          console.log("사람이 있음");
          const index = post.likes.indexOf(user._id);
          post.likes.splice(index, 1);
          console.log(post.likes);
          likeFlag = false;
        } else {
          console.log("사람이 없음");
          post.likes.push(user._id);
          console.log(post.likes);
          likeFlag = true;
        }
        return post.save();
      })
      .then((post) => {
        res.json({
          success: true,
          likes: post.likes.length,
          flag: likeFlag,
        });
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false, msg: "에러", err });
      });
  });

  // post에 comment를 단다. comment에 comment를 달 때에는? //
  app.post("/board/:boardurl/:postid/comment/post", auth, (req, res) => {
    const postId = req.params.postid; // invisible value로 수정 예정
    const comment = new Comment();
    comment._post = postId;
    comment._user = req.user._id;
    comment.contents = req.body.comment;
    comment.regDate = Date.now();

    if (!req.body.commentSn) {
      // parentComment가 없을 때
      console.log("parent comment");
      // save postid and user,
    } else {
      // parentComment가 있을 때
      console.log("child comment, parent comment is:", req.body.commentSn);
      comment.depth = 2;
      comment.parentComment = req.body.commentSn;
    }
    comment
      .save()
      .then((res) => console.log(res))
      .catch((err) => {
        console.error(err);
        res.json({ success: false, err });
      });

    /*
    if (req.body.commentSn) {
      console.log("child comment");
      Comment.findOne({ _id: req.body.commentSn }).then((self) => {
        if (!self) console.log("no comment upper");
        self.comments.push(comment);
        self.save();
      });
    } else {
      // 첫번째 root comment일때
      console.log("root comment");
      comment
        .model("posts")
        .updateOne(
          { _id: postId },
          {
            $push: { comments: comment._id },
          }
        )
        .then((comment) => {
          console.log(comment);
          console.log("comment saved in the post");
          res.redirect(`/board/${req.params.boardurl}/${postId}`);
        })
        .catch((err) => {
          console.error(err);
          res.json({ success: false, msg: "댓글을 저장하지 못했습니다.", err });
        });
    }
    */

    // save comment on db
  });
};
