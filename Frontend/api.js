// api.js
// Shared code every page loads first: talks to the backend, remembers who's
// logged in, and draws the top navigation bar.

const API = "http://localhost:3000/api";

// ---------- Session ----------

function getToken() {
  return localStorage.getItem("ems_token");
}

function getUsername() {
  return localStorage.getItem("ems_username");
}

function saveSession(token, username) {
  localStorage.setItem("ems_token", token);
  localStorage.setItem("ems_username", username);
}

function clearSession() {
  localStorage.removeItem("ems_token");
  localStorage.removeItem("ems_username");
}

function requireLogin() {
  if (!getToken()) window.location.href = "index.html";
}

function serverDownMessage() {
  return "Can't reach the server. Make sure it's running (npm start) at http://localhost:3000, then try again.";
}

// ---------- API requests ----------
// Every page calls this instead of fetch() directly. It adds the auth
// token, parses JSON, and turns error responses into a plain Error so
// callers can just show err.message.

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = token;

  let res;
  try {
    res = await fetch(API + path, { ...options, headers });
  } catch (err) {
    throw new Error(serverDownMessage());
  }

  if (res.status === 401) {
    clearSession();
    window.location.href = "index.html";
    throw new Error("Please log in first.");
  }

  const data = await res.json().catch(() => {
    throw new Error(`The server sent back an unexpected response (HTTP ${res.status}). Please try again.`);
  });

  if (!res.ok) {
    if (Array.isArray(data.errors)) throw new Error(data.errors.join(" "));
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

// ---------- Navigation ----------

function renderNav(active) {
  const topbar = document.getElementById("topbar");
  if (!topbar) return;

  const links = [
    { key: "events", href: "events.html", label: "Events" },
    { key: "attendees", href: "attendees.html", label: "Attendees" },
  ];

  topbar.innerHTML = `
    <div class="brand">
      <span class="brand-mark">EMS</span>
      <span class="brand-name">Event Ledger</span>
    </div>
    <nav>
      ${links.map((l) => `<a href="${l.href}" class="${l.key === active ? "active" : ""}">${l.label}</a>`).join("")}
    </nav>
    <div class="right">
      <span class="who">${escapeHtml(getUsername() || "")}</span>
      <button class="btn btn-secondary btn-small" id="logout-btn" type="button">Log out</button>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } catch (err) {
      // even if the request fails, still log the user out locally
    }
    clearSession();
    window.location.href = "index.html";
  });
}

// ---------- Helpers ----------

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}
