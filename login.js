const API_URL = "http://localhost:3000";


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

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  console.log("Email:", email);
  console.log("Password:", password);

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const users = await response.json();
    console.log("Users:", users);

    const user = users.find((u) => u.email === email && u.password === password);
    console.log("Found user:", user);

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      showMessage("Login successful!", "success");
      window.location.href = "index.html";
    } else {
      showMessage("Invalid credentials. Please try again.", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("Login failed. Please try again later.", "error");
  }
}

document.getElementById("loginForm").addEventListener("submit", handleLogin);

