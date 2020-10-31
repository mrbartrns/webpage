const { User } = require("../models/user");

const admin = (req, res, next) => {
  // 이미 auth middleware을 거쳐서 넘어온 상태
  const token = req.token;
  const user = req.user;

  User.findOne({ token: token, _id: user._id, role: user.role, id: user.id })
    .then((user) => {
      if (!user) res.json({ success: false, msg: "no Authorized" });
      if (user.role === 7 || user.role === 8 || user.role === 9) {
        next();
      } else {
        res.json({ success: false, msg: "no Authorized" });
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { admin };
