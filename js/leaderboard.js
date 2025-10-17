// === STARFIELD BACKGROUND ===//
const starCanvas = document.getElementById("starfield");
const starCtx = starCanvas.getContext("2d");

function resizeCanvas() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
resizeCanvas();

const stars = [];
const numStars = 100;

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * starCanvas.width,
    y: Math.random() * starCanvas.height,
    size: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.2
  });
}

function updateStarfield() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  starCtx.fillStyle = "white";
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > starCanvas.height) {
      star.y = 0;
      star.x = Math.random() * starCanvas.width;
    }
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starCtx.fill();
  });
  requestAnimationFrame(updateStarfield);
}
updateStarfield();

window.addEventListener("resize", resizeCanvas);


//----------------------------------------------------------------------//

document.addEventListener("DOMContentLoaded", () => {
  const leaderboardTable = document.querySelector("#leaderboardTable tbody");

  // get all registered users
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // filter users with a highScore
  const scoredUsers = users
    .filter(u => u.highScore)
    .sort((a, b) => b.highScore - a.highScore); // sort descending

  // populate leaderboard
  leaderboardTable.innerHTML = "";

  scoredUsers.forEach((user, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.name}</td>
      <td>${user.highScore}</td>
    `;
    leaderboardTable.appendChild(row);
  });

  // show message if no scores
  if (scoredUsers.length === 0) {
    leaderboardTable.innerHTML = `
      <tr><td colspan="3" style="text-align:center;">No scores yet</td></tr>
    `;
  }
});
