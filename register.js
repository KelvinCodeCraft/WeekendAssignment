const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerForm").addEventListener("submit", handleRegister);
});

function showMessage(message, type = "info") {
  const messageContainer = document.getElementById("messageContainer");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", `message-${type}`);
  messageElement.textContent = message;
  messageContainer.appendChild(messageElement);

  setTimeout(() => {
    messageElement.style.opacity = "0";
    setTimeout(() => {
      messageContainer.removeChild(messageElement);
    }, 300);
  }, 3000);
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();
    const user = users.find((u) => u.email === email);

    if (user) {
      showMessage("Email is already in use. Please use a different email.", "error");
      return;
    }

    const registerResponse = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "user" }),
    });

    if (registerResponse.ok) {
      showMessage("Registration successful! Please login.", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    }
  } catch (error) {
    console.error("Registration error:", error);
    showMessage("Registration failed. Please try again later.", "error");
  }
}

