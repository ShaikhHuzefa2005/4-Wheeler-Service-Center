document.getElementById("login").addEventListener("click", function () {
  window.location.href = "/login";
});
document.getElementById("signup").addEventListener("click", function () {
  window.location.href = "/register";
});

const review = document.querySelector('.review');

function autoScroll() {
  review.scrollLeft += 1;

  if (review.scrollLeft >= review.scrollWidth) {
    review.scrollLeft = 0;
  }
}

setInterval(autoScroll, 20);


