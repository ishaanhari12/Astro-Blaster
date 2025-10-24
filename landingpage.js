document.addEventListener("DOMContentLoaded", () => {
  const startGameBtn = document.getElementById("startGameBtn");

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      if (currentUser) {
        window.location.href = "game.html";
      } else {
        window.location.href = "login.html";
      }
    });
  }
});
