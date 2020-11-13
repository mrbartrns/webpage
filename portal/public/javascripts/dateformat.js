(function () {
  function getDateStr(strDate) {
    const date = new Date(strDate);
    const month = date.getMonth() + 1;
    const dates = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const today = new Date();
    if (today.getMonth() > month || today.getDate() > dates) {
      return `${month > 10 ? month : `0${month}`} - ${
        dates > 10 ? dates : `0${dates}`
      }`;
    } else {
      return `${hour > 10 ? hour : `0${hour}`} : ${
        minutes > 10 ? minutes : `0${minutes}`
      }`;
    }
  }
  const dates = document.querySelectorAll(".date");
  dates.forEach((date) => {
    const dateFormat = date.textContent;
    date.textContent = getDateStr(dateFormat);
  });
})();
