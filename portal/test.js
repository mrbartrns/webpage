const mongoose = require("mongoose");
const { Sample, Test } = require("./models/test");
const { User } = require("./models/user");
const { Post } = require("./models/post");
const { Comment } = require("./models/comment");
const { UnorderedCollection } = require("http-errors");
const e = require("express");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost:27017/boards", (err) => {
  if (err) console.error;
  console.log("mongodb server connected");
});

// const test = new Test();
// test.testString = "test string";
// test.example = "example string";

// for (let i = 0; i < 2; i++) {
//   const sample = new Sample();
//   if (i % 2 === 0) {
//     sample.text = "even sample";
//     test._sample = sample._id;
//   } else {
//     sample.text = "odd sample";
//     test._newSample = sample._id;
//   }
//   sample.save();
// }
// test.save();

// Sample.findOne({ text: "even sample" }).then((sample) => {
//   sample
//     .model("samples")
//     .findOne({ _id: sample._id })
//     .then((sample) => console.log(sample._id));
// });

Sample.findOne({ text: "even sample" }).then((sample) => {
  sample.deleteOne();
});
