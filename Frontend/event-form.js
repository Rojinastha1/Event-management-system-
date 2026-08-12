// event-form.js
// Script for the Event Add & Edit page (event-form.html).

requireLogin();
renderNav("events");

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");
const isEdit = Boolean(eventId);
const messageBox = document.getElementById("message-box");

if (isEdit) {
  document.getElementById("form-title").textContent = "Edit Event";
  loadExisting();
}

async function loadExisting() {
  try {
    const event = await apiRequest(`/events/${eventId}`);
    document.getElementById("name").value = event.name;
    document.getElementById("description").value = event.description || "";
    document.getElementById("date").value = event.date;
    document.getElementById("time").value = event.time;
    document.getElementById("location").value = event.location;
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

document.getElementById("event-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.innerHTML = "";

  const payload = {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    location: document.getElementById("location").value.trim(),
  };

  try {
    if (isEdit) {
      await apiRequest(`/events/${eventId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiRequest("/events", { method: "POST", body: JSON.stringify(payload) });
    }
    window.location.href = "events.html";
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
});
