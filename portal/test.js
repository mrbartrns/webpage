const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost:27017/boards', err => {
    if (err) console.error;
    console.log('mongodb server connected');
});

const { User } = require('./models/user');
const { Board } = require('./models/boardname');
const { Post } = require('./models/post');
const { Ip } = require('./models/ip');

const myIp = '127.0.0.1'
const date = Date.now();
const ip = new Ip();
ip.ip = myIp;
ip.expiresIn = date + 1000 * 60 * 10 * 3
ip.save()
    .then(ip =>{
        console.log(ip);
    })
console.log(date);