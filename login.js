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
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // If the server is down, fetch throws a generic "Failed to fetch"
    // TypeError - catch it and show something helpful instead. A response
    // that isn't JSON means something other than our backend answered.
    const data = await res.json().catch(() => {
      throw new Error(`The server sent back an unexpected response (HTTP ${res.status}). Please try again.`);
    });

    if (!res.ok) throw new Error(data.error || "Login failed.");

    saveSession(data.token, data.username);
    window.location.href = "events.html";
  } catch (err) {
    const message = err instanceof TypeError ? serverDownMessage() : err.message;
    messageBox.innerHTML = `<div class="message error">${escapeHtml(message)}</div>`;
  }
});
