const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// id, title, 
const comments = new Schema({
        id: {
            type: String,
            required: true,
        },
        nickName: {
            type: String,
            required: true
        },
        post_id: {
            type: String,
            required: true
        },
        upperComment_id: {
            type: String,
        },
        regDate: {
            type: String,
            required: true
        },
        modDate: {
            type: String,
        },
});

const postSchema = new Schema({
    boardName: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    nickName: {
        type: String,
        required: true
    },
    contents: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        default: []
    },
    comments: [comments],
    regDate: {
        type: String,
        required: true
    },
    modDate: {
        type: String,
    },
    image: {
        type: String
    }
});

const Post = mongoose.model('posts', postSchema);

module.exports = { Post };