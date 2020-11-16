const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
// const { User } = require('./user');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  _board: {
    type: Schema.Types.ObjectId,
    ref: "boards",
    required: true,
  },

  _user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  contents: {
    type: String,
    required: true,
    trim: true,
  },

  cleanContents: {
    type: String,
    trim: true,
    required: true,
  },

  tags: [
    {
      type: String,
    },
  ],
  /*
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comments",
      index: true,
    },
  ],
 */
  views: {
    type: Number,
    required: true,
    default: 0,
  },

  order: {
    type: Number,
  },

  // likes: {
  //   type: Number,
  //   required: true,
  //   default: 0,
  // },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  regDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },

  regDateMongo: {
    type: Date,
    default: Date.now(),
  },

  modDate: {
    type: Number,
  },

  img: {
    type: String,
  },
});

postSchema.pre("save", function (next) {
  let post = this;
  // 저장하는 것은 save에서 하므로, 수정일만
  if (post.isModified("title" || "contents" || "tags")) {
    post.modDate = Date.now();
    next();
  } else {
    next();
  }
});

postSchema.pre("deleteOne", { document: true }, function () {
  console.log("delete middleware 들어옴");
  let post = this; // post: Document
  post
    .model("comments")
    .deleteMany({ _post: { $in: post._id } })
    .then((res) => {
      console.log("연관된 댓글이 지워졌습니다.");
      console.log(res);
    })
    .catch((err) => console.log(err));
});

postSchema.methods.authorizeUser = function (token) {
  let post = this;
  let userToken;
  let isAuthorized;
  userToken = post._user.token;
  return new Promise((resolve, reject) => {
    if (!userToken || userToken !== token) {
      isAuthorized = false;
    } else {
      isAuthorized = true;
    }
    resolve(isAuthorized);
  });
};

postSchema.methods.updateView = function () {
  let post = this;
  let counter = post.views;
  console.log("previous post view:", counter);
  counter++;
  console.log("post post view:", counter);

  // return 무조건 해야 함
  return Post.findOneAndUpdate({ _id: post._id }, { $set: { views: counter } })
    .then((post) => post)
    .catch((err) => err);
};

const Post = mongoose.model("posts", postSchema);

module.exports = { Post };
