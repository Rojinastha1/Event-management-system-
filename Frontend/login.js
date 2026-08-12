// login.js
// Script for the login page (index.html).

// already logged in? skip straight to the events page
if (getToken()) window.location.href = "events.html";

const form = document.getElementById("login-form");
const messageBox = document.getElementById("message-box");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.innerHTML = "";

  // trim both fields - a stray space from autofill/paste would otherwise
  // make the server reject credentials that look exactly right
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const data = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    saveSession(data.token, data.username);
    window.location.href = "events.html";
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${escapeHtml(err.message)}</div>`;
  }
});
