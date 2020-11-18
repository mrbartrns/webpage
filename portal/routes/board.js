// auth middleware: 로그인이 되어 있다면,
const createError = require("http-errors");
const { auth } = require("../middleware/auth");
const { view } = require("../middleware/viewCount");
const { Board } = require("../models/boardname");
const { Post, Counter } = require("../models/post");
const { User } = require("../models/user");
const { Comment } = require("../models/comment");
require("dotenv").config();
// mongoose findOne => save형식으로 진행
// 아니면 그냥 쿼리 updateOne > push pull inc set 등등

module.exports = (app) => {
  // 게시판 글 목록 route
  app.get("/board/:boardurl", async (req, res, next) => {
    // 게시판 이름 및 현재 게시판 객체를 만듬
    const [boards, board] = await Promise.all([
      Board.find(),
      Board.findOne({ url: req.params.boardurl }),
    ]);

    // 현재 위치와 시작점, 끝점을 프론트엔드로 보내 하단 네비게이션을 만듬
    /**
     * PO: 현재위치w
     * STARTPOINT: 네비게이션 시작포인트
     * ENDPOINT: 네비게이션 끝 포인트
     * MAX: 전체 문서 갯수. 10배수보다 크면 ENDPOINT사용, 그렇지 않을경우 MAX값 사용
     */
    const PO = req.query.po ? Number(req.query.po) : 0;

    // console.log("po:", PO);

    const STARTPOINT =
      Math.floor(PO / Number(process.env.BOARD_ARTICLES_COUNTS)) *
      Number(process.env.BOARD_ARTICLES_COUNTS);

    // console.log("STARTPOINT:", STARTPOINT);

    const MAX = await Post.countDocuments({ _board: board._id }).then(
      (number) => {
        console.log("number:", number);
        return Math.floor(number / Number(process.env.BOARD_ARTICLES_LIMIT));
      }
    );

    // console.log("MAX:", MAX);

    const ENDPOINT =
      (PO + 1) * Number(process.env.BOARD_ARTICLES_COUNTS) < MAX
        ? (PO + 1) * Number(process.env.BOARD_ARTICLES_COUNTS)
        : MAX;

    // console.log("ENDPOINT:", ENDPOINT);

    // 쿼리에 다른 문자가 들어올경우, 에러를 내보냄
    if (typeof PO !== "number" || PO > MAX) return next(createError(404)); // have to edit

    // 30개씩 제한하여 한페이지를 구성
    Post.find({ _board: board._id })
      .populate({
        path: "_board",
        model: "boards",
      })
      .populate({
        path: "_user",
        model: "users",
      })
      .sort({ order: -1 })
      .sort({ regDate: -1 })
      .skip(PO * Number(process.env.BOARD_ARTICLES_LIMIT))
      .limit(Number(process.env.BOARD_ARTICLES_LIMIT))
      .exec()
      .then((posts) => {
        try {
          console.log(posts[0]._board.url);
        } catch (e) {
          console.log("게시판에 게시글이 없습니다.");
          console.log(e);
        }

        res.render("board_main", {
          board: board,
          boards: boards,
          posts: posts,
          po: PO,
          startpoint: STARTPOINT,
          counts: ENDPOINT,
          canGoToNext:
            (PO + 1) * Number(process.env.BOARD_ARTICLES_COUNTS) < MAX,
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
  app.post("/board/:boardurl/post", auth, async (req, res) => {
    // post 객체를 생성 > 제목, 본문, 글쓴이(req.user._id), 날짜, 수정 날짜를 저장(수정날짜는 자동으로 저장됨)
    console.log("post route입니다.");

    try {
      // ordernumber logic 수정 필요, 글 삭제 후에는 그 번호를 다시 쓰지 못하게 해야 함

      const board = await Board.findOne({ url: req.params.boardurl });
      if (!board) return res.json({ success: false, msg: err });

      let orderDoc = await Counter.findOne({
        _id: process.env.POST_MAX_ORDER_OBJECT_ID,
      });
      let orderNumber = await Post.countDocuments();
      let order =
        orderDoc.maxOrder > orderNumber ? orderDoc.maxOrder : orderNumber;

      if (orderDoc.order < order) {
        orderDoc.maxOrder = order + 1;
      } else {
        orderDoc.maxOrder = orderDoc.maxOrder + 1;
      }
      orderDoc.save();

      const post = new Post();

      post.title = req.body.title;
      post.contents = req.body.contents;
      post.cleanContents = req.body.cleanContents;
      post._user = req.user._id;
      post.regDate = Date.now();
      post.order = orderDoc.maxOrder;
      post._board = board;

      // console.log("post:", post);

      const result = await post.save();

      if (!result) return res.json({ success: false, msg: "err" });

      res.redirect(`/board/${req.params.boardurl}`);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err });
    }
  });

  // 게시글 본문 route
  app.get("/board/:boardurl/:order", view, async (req, res) => {
    let likeFlag;
    let token = req.token;
    let login = req.isLogined;
    let order = req.params.order;

    // x_auth is name of Cookie
    try {
      const board = await Board.findOne({ url: req.params.boardurl });

      const post = await Post.findOne({ order: order, _board: board._id })
        .populate({
          path: "_board",
          model: "boards",
        })
        .populate({
          path: "_user",
          model: "users",
        });

      likeFlag = post.likes.indexOf(req.user._id) !== -1 ? true : false;

      // 본인이 쓴 글인지 확인
      let isAuthorized = await post.authorizeUser(token);

      const comments = await Comment.find({ _post: post._id })
        .populate({
          path: "_user",
          model: "users",
        })
        .sort({ order: 1 });

      res.render("board_article", {
        post: post,
        comments: comments,
        isMe: isAuthorized,
        isLogined: login,
        token: token,
        title: `${post._board.boardName} - Portal`,
        likeFlag,
        likeFlag,
      });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err });
    }
  });

  // 게시글 수정 route
  app.get("/board/:boardurl/:order/edit", auth, async (req, res) => {
    try {
      const board = await Board.findOne({ url: req.params.boardurl });
      const order = req.params.order;

      const post = await Post.findOne({ order: order, _board: board._id })
        .populate({
          path: "_board",
          model: "boards",
        })
        .populate({
          path: "_user",
          model: "users",
        });

      if (!post)
        return res.json({
          success: false,
          msg: "올바르지 않은 게시판 또는 postid",
        });

      const isAuthorized = await post.authorizeUser(req.token);
      if (!isAuthorized)
        return res.json({ success: false, msg: "올바르지 않은 유저" });

      res.render("board_post_edit", {
        board: board,
        title: "글 수정하기",
        post: post,
      });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err });
    }
  });

  // 게시글 수정 post
  app.post("/board/:boardurl/:postid/edit", auth, (req, res) => {
    console.log("게시글 수정 route");

    // 바뀐 내용을 post에 저장
    Post.findOne({ _id: req.params.postid })
      .then((post) => {
        post.title = req.body.title;
        post.contents = req.body.contents;
        post.cleanContents = req.body.cleanContents;
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
    const postId = req.body.postId;
    console.log(postId);

    Post.findOne({ _id: postId })
      .then((post) => {
        console.log("post를 찾았습니다");

        if (post.likes.indexOf(user._id) !== -1) {
          console.log("사람이 있음");
          const index = post.likes.indexOf(user._id);
          post.likes.splice(index, 1);
          console.log("like 한 사람:", post.likes);
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
};
