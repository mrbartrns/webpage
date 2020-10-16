const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const boardSchema = new Schema({
    boardName: {
        type: String,
        required: true,
    },
    madeDate: {
        type: String,
    },
    manager: [{
        id: { type: String}
    }]
});

const Board = mongoose.model('boards', boardSchema);

module.exports = { Board };