const { auth } = require("../middleware/auth");

module.exports = (app) => {
  app.get("/auth", auth, (req, res) => {
    // 이 함수는 이미 auth를 통과했을 때 실행되는 함수이다.
    res.status(200).json({
      _id: req._id, // _id가 노출되지 않는다.
      isAdmin: req.user.role === 1 ? true : false,
      isAuth: true,
      email: req.user.email,
      nickName: req.user.nickName,
      role: req.user.role,
    });
  });
};
