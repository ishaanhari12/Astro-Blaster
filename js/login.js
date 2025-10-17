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
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const successMessage = document.getElementById("successMessage");

    // Reset messages
    emailError.textContent = "";
    passwordError.textContent = "";
    successMessage.textContent = "";

    let valid = true;

    // === VALIDATION RULES ===
    if (email === "") {
      emailError.textContent = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = "Enter a valid email address.";
      valid = false;
    }

    if (password === "") {
      passwordError.textContent = "Password is required.";
      valid = false;
    }

    if (!valid) return;

    // === CHECK AGAINST REGISTERED USERS ===
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!matchedUser) {
      passwordError.textContent = "Invalid email or password.";
      return;
    }

    // === LOGIN SUCCESS ===
    sessionStorage.setItem("currentUser", JSON.stringify(matchedUser));
    successMessage.textContent = "Login successful! Redirecting...";

    setTimeout(() => {
      window.location.href = "game.html";
    }, 1500);
  });
});
