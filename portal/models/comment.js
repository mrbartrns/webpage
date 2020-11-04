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

  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
  ],

  depth: {
    type: Number,
    required: true,
    default: 1,
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

commentSchema.pre("deleteOne", { document: true }, function () {
  let comment = this;
  comment
    .model("posts")
    .updateOne(
      { comments: { $in: comment._id } },
      {
        $pull: { comments: comment._id },
      }
    )
    .then((res) => res)
    .catch((err) => err);

  // comment에 달린 comment는 삭제되지 않을 것
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = { Comment };
