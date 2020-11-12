const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// id, title,
const commentSchema = new Schema({
  _post: {
    type: Schema.Types.ObjectId,
    ref: "posts",
    required: true,
  },

  _user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  contents: {
    type: String,
    required: true,
  },

  img: {
    type: String,
  },

  likes: {
    type: Number,
    required: true,
    default: 0,
  },

  regDate: {
    type: Date,
    required: true,
  },

  modDate: {
    type: Date,
  },

  parentComment: {
    type: Schema.Types.ObjectId,
    ref: "comments",
  },

  depth: {
    type: Number,
    required: true,
    default: 1,
  },

  order: {
    type: Number,
    required: true,
  },

  childs: {
    type: Number,
    default: 0,
  },
});

commentSchema.pre("save", function (next) {
  let comment = this;
  if (comment.isModified("contents")) {
    comment.modDate = Date.now();
    next();
  } else {
    next();
  }
});

// 작동 x
commentSchema.statics.setOrderNumber = async function (postId, commentSn) {
  let comment = this;
  let order;
  if (!commentSn) {
    order = await comment
      .find({ _posat: postId })
      .sort({ order: -1 })
      .limit(1)
      .then((standard) => {
        return standard.length === 0 ? 0 : standard[0].order;
      })
      .catch((err) => console.error(err));

    order++;
    return order;
  } else {
    let parentOrder, parentChilds;

    await comment.findOne({ _id: commentSn }).then((parent) => {
      parentOrder = parent.order;
      childs = parent.childs;
      parentChilds = parent.childs + 1;
      parent.childs = parentChilds;
      order = parentOrder + childs + 1;
      parent.save();

      comment.updateMany(
        { _post: postId, order: { $gt: parentOrder + childs } },
        { $inc: { order: 1 } }
      );
      return order;
    });
  }
};

const Comment = mongoose.model("comments", commentSchema);

module.exports = { Comment };
