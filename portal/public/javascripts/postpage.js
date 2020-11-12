window.onload = () => {
  const likeBtn = document.querySelector(".like"),
    articleArea = document.querySelector(".article"),
    // commentPosts = document.querySelectorAll('.comment-post'),
    deleteLink = document.querySelector(".delete"),
    commentEditBtns = document.querySelectorAll(".comment-edit"),
    commentReplybtns = document.querySelectorAll(".comment-reply"),
    commentBox = document.querySelector("#comment-box"),
    BOARD_URL = document.querySelector("#boardurl"),
    POST_ID = document.querySelector("#postid");

  function deletePost() {
    if (confirm("정말 삭제하시겠습니까?")) {
      fetch(`/board/${BOARD_URL}/${POST_ID}/delete`, {
        method: "POST",
        redirect: "follow",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            alert(res.msg);
            window.location.href = `/board/${BOARD_URL}`;
          }
        })
        .catch((err) => console.error(err));
    }
  }

  // 답글버튼을 눌렀을 때, comment box가 이동하게 하는 함수
  function showCommentPostBox() {
    let postComment = document.querySelector("#comment-box");
    postComment.remove();
    const commentRow = this.parentNode.parentNode;
    const html = `<div class="comment-post-area" id="comment-box">
      <textarea rows="3" oninput="autoGrow(this)" id="comment-write"></textarea>
      <button type="button" id="post-comment" onclick="submitComment(this, '${commentRow.dataset.commentsn}')">글쓰기</button>
    </div>`;

    commentRow.insertAdjacentHTML("afterend", html);
    // let postBtn = document.querySelector("#post-comment");
    console.log(commentRow);
  }

  likeBtn.addEventListener("click", (e) => {
    console.log(e);
    console.log("clicked");
    fetch(`/board/${POST_ID}/like`, {
      method: "POST",
    })
      .then((blob) => blob.json())
      .then((json) => {
        if (json.success) {
          console.log(json);
          likeBtn.textContent = json.likes;
          if (json.flag) {
            likeBtn.classList.remove("btn-outline-danger");
            likeBtn.classList.add("btn-danger");
          } else {
            likeBtn.classList.remove("btn-danger");
            likeBtn.classList.add("btn-outline-danger");
          }
        } else {
          console.log(json);
        }
      });
  });

  if (deleteLink) {
    deleteLink.addEventListener("click", deletePost);
  }

  if (commentReplybtns) {
    commentReplybtns.forEach((btn) => {
      btn.addEventListener("click", showCommentPostBox);
    });
  }

  /*
  if (commentEditBtns) {
    commentEditBtns.forEach(btn => {
      btn.addEventListener('click', editComment);
    })
  }
  */
};
