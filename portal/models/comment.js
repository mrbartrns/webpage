const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// id, title, 
const commentSchema = new Schema({
    post_id: {
        type: String,
        required: true
    },

    Comment_id: {
        type: String,
    },

    id: {
        type: String,
        required: true,
    },

    nickName: {
        type: String,
        required: true
    },

    img: {
        type: String
    },

    likes: {
        type: Number,
        required: true,
        default: 0
    },
    
    regDate: {
        type: String,
        required: true
    },

    modDate: {
        type: String,
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'comments'
    }]
});


const Comment = mongoose.model('comments', commentSchema);

module.exports = { Comment };