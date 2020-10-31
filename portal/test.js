const mongoose = require("mongoose");
const test = require("./models/test");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect("mongodb://localhost:27017/boards", (err) => {
  if (err) console.error;
  console.log("mongodb server connected");
});

const { Test, Sample } = require("./models/test");

// for (let i = 0; i < 2; i++) {
//   const sample = new Sample();
//   sample.text = "bye";
//   sample.save();
//   Test.findOne({ _id: "5f8fe43bfdc88257f8086934" })
//     .then((test) => {
//       test._sample.push(sample._id);
//       return test.save();
//     })
//     .then((test) => console.log(test));
// }

console.log(test);
Test.findOne({ _id: "5f8fe43bfdc88257f8086934" })
  // can use splice after populate
  .populate({
    path: "_sample",
    model: "samples",
  })
  .then((test) => {
    console.log("type:", typeof test._sample);
    test._sample.splice(0, test._sample.length);
    console.log(test);
  });
