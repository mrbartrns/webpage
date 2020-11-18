const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const boardSchema = new Schema({
  boardName: {
    type: String,
    required: true,
    unique: 1,
  },

  url: {
    type: String,
    required: true,
    unique: 1,
  },

  madeDate: {
    type: String,
  },

  manager: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  description: {
    type: String,
  },

  auth: {
    type: Number,
    default: 0,
  },
});

const Board = mongoose.model("boards", boardSchema);

module.exports = { Board };
