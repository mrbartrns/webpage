const { Post } = require("../models/post");
const { Ip } = require("../models/ip");

const delta = 600000;

// 새로고침시마다 viewCount를 증가시키지 말고 한번 증가 후 얼마 있다가 증가로
let view = (req, res, next) => {
  const date = Date.now();
  Ip.findOne({ ip: req.ip })
    .then((ip) => {
      console.log("found ip Document");
      if (!ip) {
        console.log("document not found");
        const ip = new Ip();

        ip.ip = req.ip;
        ip.expiresIn = date + delta;

        ip.save().then((_) => {
          Post.findOne({ order: req.params.order })
            .then((post) => post.updateView())
            .then((post) => console.log("new post view:", post.views))
            .catch((err) => console.error(err));
          next();
        });
      } else {
        if (ip.expiresIn < date) {
          Post.findOne({ order: req.params.order })
            .then((post) => post.updateView())
            .then((_) =>
              Ip.findOneAndUpdate(
                { ip: ip.ip },
                { expiresIn: (newtime = date + delta) }
              )
            )
            .catch((err) => console.error(err));
        }
        next();
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = { view };
