// api.js
// Small helper used by every page. Keeps the login token in localStorage
// and sends it along with every request.

// The page can be served by the backend itself (http://localhost:3000 or
// http://<your-lan-ip>:3000), or opened directly / via Live Server on another
// port. When our own backend serves the page we use same-origin /api, so
// login keeps working even from another device on the network (where
// "localhost" would point at the wrong machine).
const servedByBackend =
  window.location.protocol.startsWith("http") && window.location.port === "3000";
const API = servedByBackend ? "/api" : "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUsername() {
  return localStorage.getItem("username");
}

function saveSession(token, username) {
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
}

// Call this at the top of every page that needs the user to be logged in.
function requireLogin() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

// Shown whenever the browser can't reach the backend at all (it isn't
// running, crashed, or the port changed). Much clearer than "Failed to fetch".
function serverDownMessage() {
  return "Can't reach the server. Make sure it's running: in the project folder, run `npm start` and keep the terminal open.";
}

// A simple fetch wrapper that adds the token and handles errors.
async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", Authorization: getToken() || "" };

  // When the server is down, fetch throws a generic "Failed to fetch"
  // TypeError - catch it and show something helpful instead.
  let res;
  try {
    res = await fetch(API + path, { ...options, headers });
  } catch (err) {
    console.error(err); // keep the real reason in the dev console
    throw new Error(serverDownMessage());
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = "index.html";
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.errors ? data.errors.join(" ") : data.error || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

// Renders the top navigation bar. Call with "events" or "attendees".
function renderNav(active) {
  const el = document.getElementById("topbar");
  if (!el) return;

  el.innerHTML = `
    <div class="brand">Event Management System</div>
    <nav>
      <a href="events.html" class="${active === "events" ? "active" : ""}">Events</a>
      <a href="attendees.html" class="${active === "attendees" ? "active" : ""}">Attendees</a>
    </nav>
    <div class="right">
      <span>${getUsername() || ""}</span>
      <button class="btn btn-secondary btn-small" id="logout-btn">Log out</button>
    </div>
  `;
  document.getElementById("logout-btn").addEventListener("click", logout);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
