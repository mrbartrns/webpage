const mongoose = require("mongoose");
const { Sample, Test } = require("./models/test");
const { User } = require("./models/user");
const { Post } = require("./models/post");
const { Comment } = require("./models/comment");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost:27017/boards", (err) => {
  if (err) console.error;
  console.log("mongodb server connected");
});

const test = new Test();
test.testString = "test string";
test.example = "example string";
const sample = new Sample();
sample.text = "test sample";
sample.save();
for (let i = 0; i < 2; i++) {
  test._sample.push(sample);
}
test.save();

// console.log(test);
// console.log(sample);

// Sample.findOne({ text: "test sample" })
//   .then((sample) => {
//     sample.deleteOne();
//   })
//   .then((res) => {
//     console.log(res);
//   });

/**
 * findOne => push, save => updateOne이랑 똑같음
 */

// Test.findOne({ _sample: "5fa351e770afb6276c1e52c7" }).then((test) =>
//   console.log(test)
// );
// Test.findOne({ _id: "5fa351e770afb6276c1e52c6" }).then((test) =>
//   console.log(test)
// );

Test.findOne({ _sample: sample }).then((test) => console.log(test));
