const { auth } = require("../middleware/auth");
const { Comment } = require("../models/comment");

module.exports = (app) => {
  app.post("/board/:boardurl/:postid/comment/post", auth, async (req, res) => {
    const postId = req.params.postid; // invisible value로 수정 예정
    const comment = new Comment();
    comment._post = postId;
    comment._user = req.user._id;
    comment.contents = req.body.comment;
    comment.regDate = Date.now();

    let order;
    /** 가장 높은 order
     *
     */

    if (!req.body.commentSn) {
      // parentComment가 없을 때
      console.log("parent comment");
      console.log("finding order number");

      order = await Comment.find({ _post: postId })
        .sort({ order: -1 })
        .limit(1)
        .then((standard) => {
          console.log("standard:", standard);
          console.log("found standard");
          return standard.length === 0 ? 0 : standard[0].order;
        })
        .catch((err) => {
          console.error(err);
        });

      // save postid and user
      order++;
      console.log("order number:", order);
    } else {
      // parentComment가 있을 때
      let parentOrder, parentChilds, childs;
      console.log("child comment, parent comment is:", req.body.commentSn);
      comment.depth = 2;
      comment.parentComment = req.body.commentSn;

      // find parentComment and sum parentOrder + childs + 1
      await Comment.findOne({ _id: req.body.commentSn })
        .then((parent) => {
          parentOrder = parent.order;
          console.log("parentOrder:", parentOrder);
          childs = parent.childs;
          parentChilds = parent.childs + 1;
          parent.childs = parentChilds;
          order = parentOrder + childs + 1;
          console.log("order:", order);

          parent.save();
          return Comment.updateMany(
            { _post: postId, order: { $gt: parentOrder + childs } },
            { $inc: { order: 1 } }
          );
        })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    comment.order = order;
    comment
      .save()
      .then((result) => {
        console.log(result);
        res.json({ success: true });
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false, err });
      });
  });
};
