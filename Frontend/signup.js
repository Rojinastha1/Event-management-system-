// signup.js
// Script for the signup page (signup.html).

if (getToken()) window.location.href = "events.html";

const form = document.getElementById("signup-form");
const messageBox = document.getElementById("message-box");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.innerHTML = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm").value.trim();

  if (password !== confirm) {
    messageBox.innerHTML = `<div class="message error">Passwords don't match.</div>`;
    return;
  }

  try {
    const data = await apiRequest("/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    saveSession(data.token, data.username);
    window.location.href = "events.html";
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${escapeHtml(err.message)}</div>`;
  }
});
