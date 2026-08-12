// event-view.js
// Script for the View Event page (event-view.html): shows event details
// and handles registering / unregistering attendees.

requireLogin();
renderNav("events");

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");
const messageBox = document.getElementById("message-box");

if (!eventId) window.location.href = "events.html";
document.getElementById("edit-link").href = `event-form.html?id=${eventId}`;

async function loadEvent() {
  try {
    const event = await apiRequest(`/events/${eventId}`);

    document.getElementById("event-name").textContent = event.name;
    document.getElementById("event-description").textContent = event.description || "-";
    document.getElementById("event-date").textContent = event.date;
    document.getElementById("event-time").textContent = event.time;
    document.getElementById("event-location").textContent = event.location;

    renderAttendeeRows(event.attendees);
    await loadAttendeeDropdown(event.attendees);
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

function renderAttendeeRows(attendees) {
  const rows = document.getElementById("rows");
  if (attendees.length === 0) {
    rows.innerHTML = `<tr class="empty"><td colspan="4">No attendees registered yet.</td></tr>`;
    return;
  }
  rows.innerHTML = attendees.map((a) => `
    <tr>
      <td>${escapeHtml(a.name)}</td>
      <td>${escapeHtml(a.email)}</td>
      <td>${escapeHtml(a.phone)}</td>
      <td><button class="btn btn-danger btn-small" onclick="unregister(${a.id})">Remove</button></td>
    </tr>
  `).join("");
}

async function loadAttendeeDropdown(registeredAttendees) {
  const all = await apiRequest("/attendees");
  const registeredIds = registeredAttendees.map((a) => a.id);
  const available = all.filter((a) => !registeredIds.includes(a.id));

  const select = document.getElementById("attendee-select");
  if (available.length === 0) {
    select.innerHTML = `<option value="">No more attendees to add</option>`;
    document.getElementById("register-btn").disabled = true;
    return;
  }
  document.getElementById("register-btn").disabled = false;
  select.innerHTML = available.map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join("");
}

document.getElementById("register-btn").addEventListener("click", async () => {
  const attendeeId = document.getElementById("attendee-select").value;
  if (!attendeeId) return;
  try {
    await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify({ eventId: Number(eventId), attendeeId: Number(attendeeId) }),
    });
    loadEvent();
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
});

async function unregister(attendeeId) {
  if (!confirm("Remove this attendee from the event?")) return;
  try {
    await apiRequest("/unregister", {
      method: "POST",
      body: JSON.stringify({ eventId: Number(eventId), attendeeId }),
    });
    loadEvent();
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

loadEvent();
