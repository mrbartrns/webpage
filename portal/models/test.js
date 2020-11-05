const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const testSchema = new Schema({
  testString: {
    type: String,
  },

  example: {
    type: String,
  },

  _sample: [
    {
      type: Schema.Types.ObjectId,
      ref: "samples",
    },
  ],

  // _newSample: [{ type: Schema.Types.ObjectId, ref: "samples" }],
});

const sampleSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
});

// this를 document로 부를때 document: true 옵션 필요 > deleteone의 경우 document, query 둘다 가능 그래서 구분해줘야 함

// sampleSchema.pre("deleteOne", { document: true }, function () {
//   console.log("hihihiihhii");
//   console.log("middleware로 들어옴");
//   let sample = this;
//   console.log(sample._id);

//   sample
//     .model("tests")
//     .updateOne(
//       {
//         _sample: { $in: sample._id },
//       },
//       { $pullAll: { _sample: [sample._id], _newSample: [sample._id] } }
//     )
//     .then((res) => console.log(res))
//     .catch((err) => console.error(err));
// });

sampleSchema.pre("deleteOne", { document: true }, function () {
  console.log("new test");
  let sample = this;
  sample
    .model("tests")
    .findOne({ _sample: sample._id })
    .then((test) => {
      console.log("I got a sample");
      test._sample.pull(sample._id);
      return test.save();
    })
    .then((test) => console.log(test));
});

const Test = mongoose.model("tests", testSchema);

const Sample = mongoose.model("samples", sampleSchema);

module.exports = { Test, Sample };
