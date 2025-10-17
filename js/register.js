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


// === REGISTER PAGE LOGIC ===//

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const loginButton = document.getElementById('loginButton');
  const usersKey = 'gameUsers';

  if (!form) return; // Exit if not on register page

  loginButton.addEventListener('click', () => {
    window.location.href = 'login.html';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    document.getElementById('successMessage').textContent = '';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let isValid = true;

    // Validation
    if (name.length < 3) {
      document.getElementById('nameError').textContent = 'Name must be at least 3 characters.';
      isValid = false;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
      document.getElementById('emailError').textContent = 'Enter a valid email.';
      isValid = false;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phone.match(phonePattern)) {
      document.getElementById('phoneError').textContent = 'Phone must be 10 digits.';
      isValid = false;
    }

    if (password.length < 6) {
      document.getElementById('passwordError').textContent = 'Password must be at least 6 characters.';
      isValid = false;
    }

    if (confirmPassword !== password) {
      document.getElementById('confirmPasswordError').textContent = 'Passwords do not match.';
      isValid = false;
    }

    if (!isValid) return;

    // Save to localStorage
    const users = JSON.parse(localStorage.getItem(usersKey)) || [];
    const emailExists = users.some(user => user.email === email);

    if (emailExists) {
      document.getElementById('emailError').textContent = 'Email already registered.';
      return;
    }

    users.push({ name, email, phone, password });
    localStorage.setItem(usersKey, JSON.stringify(users));

    document.getElementById('successMessage').innerHTML = 
      'Registration successful! ✅<br><a href="login.html" class="go-login">Go to Login</a>';
    form.reset();

  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Error message elements
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const successMessage = document.getElementById("successMessage");

    // Reset errors
    nameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    successMessage.textContent = "";

    let valid = true;

    // === VALIDATION RULES ===

    // Name validation
    if (name === "") {
      nameError.textContent = "Full name is required.";
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      nameError.textContent = "Name can only contain letters and spaces.";
      valid = false;
    }

    // Email validation
    if (email === "") {
      emailError.textContent = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = "Enter a valid email address.";
      valid = false;
    }

    // Phone validation
    if (phone === "") {
      phoneError.textContent = "Phone number is required.";
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      phoneError.textContent = "Enter a valid 10-digit phone number.";
      valid = false;
    }

    // Password validation
    if (password === "") {
      passwordError.textContent = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters.";
      valid = false;
    }

    // Confirm password validation
    if (confirmPassword === "") {
      confirmPasswordError.textContent = "Please confirm your password.";
      valid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError.textContent = "Passwords do not match.";
      valid = false;
    }

    // If not valid, stop here
    if (!valid) return;

    // === STORE IN LOCAL STORAGE ===
    const newUser = { name, email, phone, password };

    // Get existing users or empty array
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already registered
    const emailExists = users.some((user) => user.email === email);
    if (emailExists) {
      emailError.textContent = "This email is already registered.";
      return;
    }

    // Add new user and save
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Show success message
    successMessage.innerHTML = 
      'Registration successful! ✅<br><a href="login.html" class="go-login">Go to Login</a>';

    form.reset();
  });
});
