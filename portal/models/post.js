const { ExpectationFailed } = require('http-errors');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
    boardId: {
        type: Schema.Types.ObjectId,
        ref: 'boards',
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

    title: {
        type: String,
        required: true
    },
    
    contents: {
        type: String,
        required: true
    },

    tags: {
        type: String,
        default: []
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref:'comments'
    }],

    views: {
        type: Number,
        required: true,
        default: 0
    },

    likes: {
        type: Number,
        required: true,
        default: 0
    },

    regDate: {
        type: Date,
        required: true,
        default: Date.now()
    },

    modDate: {
        type: Date,
    },

    img: {
        type: String
    }
});

postSchema.post('save', function() {
    Post
        .find()
        .sort({regDate: 1})
        .exec()
});


const Post = mongoose.model('posts', postSchema);

module.exports = { Post };
