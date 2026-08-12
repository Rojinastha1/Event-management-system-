// attendee-form.js
// Script for the Attendee Add & Edit page (attendee-form.html).

requireLogin();
renderNav("attendees");

const params = new URLSearchParams(window.location.search);
const attendeeId = params.get("id");
const isEdit = Boolean(attendeeId);
const messageBox = document.getElementById("message-box");

if (isEdit) {
  document.getElementById("form-title").textContent = "Edit Attendee";
  loadExisting();
}

async function loadExisting() {
  try {
    const attendee = await apiRequest(`/attendees/${attendeeId}`);
    document.getElementById("name").value = attendee.name;
    document.getElementById("email").value = attendee.email;
    document.getElementById("phone").value = attendee.phone;
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
}

document.getElementById("attendee-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  messageBox.innerHTML = "";

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };

  try {
    if (isEdit) {
      await apiRequest(`/attendees/${attendeeId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiRequest("/attendees", { method: "POST", body: JSON.stringify(payload) });
    }
    window.location.href = "attendees.html";
  } catch (err) {
    messageBox.innerHTML = `<div class="message error">${err.message}</div>`;
  }
});
