const loginButton = document.getElementById("login");
const loginWrapper = document.getElementById("login-wrapper");
const closeButton = document.getElementById("close-btn");
const registerLink = document.querySelector(".register-link");
const loginLink = document.querySelector(".login-link");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const recorded = document.getElementById('recordedVideo');
const sendNow = document.getElementById('btn-send');

// Show login form on login button click
loginButton.addEventListener("click", () => {
  loginWrapper.style.display = "flex";
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  recorded.style.display = "none";
  sendNow.style.display = "none";
});

// Show registration form on register link click
registerLink.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

// Show login form on login link click in the registration form
loginLink.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default anchor behavior
  loginForm.style.display = "block";
  registerForm.style.display = "none";
});

// Hide login/registration form on close button click
closeButton.addEventListener("click", () => {
  loginWrapper.style.display = "none";
  recorded.style.display = "flex";
  sendNow.style.display = "block";
});

