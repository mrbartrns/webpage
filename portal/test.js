const mongoose = require("mongoose");
const { Sample, Test } = require("./models/test");
const { User } = require("./models/user");
const { Post } = require("./models/post");
const { Comment } = require("./models/comment");
const { UnorderedCollection } = require("http-errors");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost:27017/boards", (err) => {
  if (err) console.error;
  console.log("mongodb server connected");
});

User.findOne({ id: "testtest3" }).then((user) => {
  console.log(user.myComments.$);
});
// User.updateOne(
//   { id: "testtest3" },
//   { $pull: { myComments: "5f9fd285188e4a0d1cab7a3d" } }
// )
//   .then((res) => console.log(res))
//   .catch((err) => console.error(err));
