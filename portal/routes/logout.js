const { auth } = require("../middleware/auth");
const { login } = require("../middleware/islogin");
const { User } = require("../models/user");
const { TokenBlackList } = require("../models/token");

module.exports = (app) => {
  app.get("/logout", login, (req, res) => {
    const token = req.token;
    const tokenBlackList = new TokenBlackList();
    tokenBlackList.token = token;
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" })
      .then(() => {
        tokenBlackList.save().then(() => {
          res
            .clearCookie("x_auth")
            .clearCookie("r_auth")
            // .json({ success: true });
            .redirect("/");
        });
      })
      .catch((err) => res.json({ success: false, err }));
  });
};
