// events.js
// Script for the Events List page (events.html): loads, searches, and deletes events.

requireLogin();
renderNav("events");

const rows = document.getElementById("rows");
const messageBox = document.getElementById("message-box");
const searchInput = document.getElementById("search");

async function loadEvents() {
  try {
    const search = searchInput.value.trim();
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const events = await apiRequest(`/events${query}`);

    if (events.length === 0) {
      rows.innerHTML = `<tr class="empty"><td colspan="5">No events found.</td></tr>`;
      return;
    }

    rows.innerHTML = events.map((e) => `
      <tr>
        <td><a href="event-view.html?id=${e.id}">${escapeHtml(e.name)}</a></td>
        <td>${e.date}</td>
        <td>${escapeHtml(e.location)}</td>
        <td><span class="count-stamp">${e.attendeeCount}</span></td>
        <td class="actions">
          <a href="event-view.html?id=${e.id}" class="btn btn-secondary btn-small">View</a>
          <a href="event-form.html?id=${e.id}" class="btn btn-secondary btn-small">Edit</a>
          <button class="btn btn-danger btn-small" onclick="deleteEvent(${e.id})">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;
  try {
    await apiRequest(`/events/${id}`, { method: "DELETE" });
    loadEvents();
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

let timer;
searchInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(loadEvents, 250);
});

loadEvents();
