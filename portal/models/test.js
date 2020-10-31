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
      required: true,
    },
  ],
});

const sampleSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
});

const Test = mongoose.model("tests", testSchema);

const Sample = mongoose.model("samples", sampleSchema);

module.exports = { Test, Sample };
