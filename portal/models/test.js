const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const testSchema = new Schema({
  testString: {
    type: String,
    minlength: 8,
    required: true,
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

// sampleSchema.sampleSchema.pre("deleteOne", { document: true }, function () {
//   console.log("new test");
//   let sample = this;
//   sample
//     .model("tests")
//     .findOne({ _sample: sample._id })
//     .then((test) => {
//       console.log("I got a sample");
//       test._sample.pull(sample._id);
//       return test.save();
//     })
//     .then((test) => console.log(test));
// });

const Test = mongoose.model("tests", testSchema);

const Sample = mongoose.model("samples", sampleSchema);

module.exports = { Test, Sample };
