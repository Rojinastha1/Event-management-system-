// attendees.js
// Script for the Attendee List page (attendees.html): loads, searches, and deletes attendees.

requireLogin();
renderNav("attendees");

const rows = document.getElementById("rows");
const messageBox = document.getElementById("message-box");
const searchInput = document.getElementById("search");

async function loadAttendees() {
  try {
    const search = searchInput.value.trim();
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const attendees = await apiRequest(`/attendees${query}`);

    if (attendees.length === 0) {
      rows.innerHTML = `<tr class="empty"><td colspan="4">No attendees found.</td></tr>`;
      return;
    }

    rows.innerHTML = attendees.map((a) => `
      <tr>
        <td>${escapeHtml(a.name)}</td>
        <td>${escapeHtml(a.email)}</td>
        <td>${escapeHtml(a.phone)}</td>
        <td class="actions">
          <a href="attendee-form.html?id=${a.id}" class="btn btn-secondary btn-small">Edit</a>
          <button class="btn btn-danger btn-small" onclick="deleteAttendee(${a.id})">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

async function deleteAttendee(id) {
  if (!confirm("Delete this attendee?")) return;
  try {
    await apiRequest(`/attendees/${id}`, { method: "DELETE" });
    loadAttendees();
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

let timer;
searchInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(loadAttendees, 250);
});

loadAttendees();
