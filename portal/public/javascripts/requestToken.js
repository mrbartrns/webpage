// if req.r_auth가 있다면, 재요청, 그렇지 않을경우 x
//
(function () {
  function requestToken() {
    fetch("/token")
      .then((res) => res.json())
      .then((res) => {
        if (res.success === true) {
          // console.log(res);
        } else {
          // console.log("failed to extend the cookie");
        }
      });
  }

  console.log(document.cookie);
  const timer = setTimeout(() => {
    console.log("로그아웃 실행");
    fetch("/logout");
  }, 1000 * 60 * 60);

  // clearTimeout(timer);
  requestToken();
})();