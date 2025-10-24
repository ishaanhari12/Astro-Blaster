import Starfield from "./Starfield.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("starfield");
  if (canvas) {
    const starfield = new Starfield("starfield"); // instantiate the class
    // the starfield updates itself internally via requestAnimationFrame
  }

  // Start button logic
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
