# Event Management System (Simple / Beginner Version)

A beginner-friendly version of the Event Management System. Everything lives in **one flat folder** (no `backend`/`frontend` subfolders to navigate into), and the "database" is just a plain JSON file (`data.json`) instead of a real database - easy to open and read.

## Files

```
simple-event-management/
├── server.js            <- the backend (run this with node)
├── data.json             <- stores events, attendees, registrations, and the admin user
├── package.json
├── style.css              <- shared styles for every page
├── api.js                <- shared helper: talks to the backend, remembers login
├── index.html            <- login page (markup only)
├── login.js              <- script for the login page
├── events.html            <- Event List Page (markup only)
├── events.js             <- script for the events list page
├── event-view.html         <- View Event Page (markup only)
├── event-view.js          <- script for the event details page
├── event-form.html        <- Event Add & Edit Page (markup only)
├── event-form.js         <- script for the event form page
├── attendees.html          <- Attendee List Page (markup only)
├── attendees.js          <- script for the attendee list page
├── attendee-form.html     <- Attendee Add & Edit Page (markup only)
└── attendee-form.js      <- script for the attendee form page
```

## How the code is organized

Each HTML page contains only markup and `<script src="..."></script>` tags — there is no JavaScript embedded in the HTML files.

- `api.js` holds the shared code every page uses (login token, `apiRequest`, nav bar, etc.).
- Each page has its own `page.js` file (e.g. `events.js`, `event-view.js`) with the code specific to that page.
- Every page loads `api.js` first, then its own page script.

## How to run it

Open a terminal **inside this folder** (the one with `package.json` in it):

```
npm install
npm start
```

You should see:
```
Created default admin user -> username: admin, password: admin123
Event Management System running at http://localhost:3000
```

Leave that terminal open, then go to **http://localhost:3000** in your browser.

Log in with:
- Username: `admin`
- Password: `admin123`

### Easier: just double-click `start.command`

On macOS you don't need to type any commands - double-click **`start.command`** in the
project folder. It opens a Terminal window and starts the server for you. If the server
is already running it simply opens the browser instead. Keep the Terminal window open
while you use the app.

## Using VS Code Live Server instead

You can right-click `index.html` and choose "Open with Live Server" if you prefer. It'll open on a different port (like 5500), which is fine - every page is already set up to talk to the backend at `http://localhost:3000` no matter what port serves the HTML.

Just make sure the backend is still running (`npm start`) in a separate terminal at the same time - Live Server only shows the pages, it can't save events or check your login by itself.

## How it works (in plain terms)

- **No real database.** `server.js` just reads and writes `data.json` using `fs.readFileSync` / `fs.writeFileSync`. Open that file any time to see exactly what's stored.
- **No JWT library.** When you log in successfully, the server makes up a random string (a "token") and remembers it in a list while it's running. Every page sends that token back with each request; if it's not in the list, the server says "please log in first" (401), and the frontend sends you back to the login page.
- **Passwords are hashed**, not stored as plain text, using the `bcryptjs` library (`bcrypt.hashSync`).
- **Validation** happens on the server: required fields can't be blank, and email addresses must look like an email. If something's wrong, the server sends back a list of specific error messages, which show up in a red box on the form.
- **Registration** is just a list of `{ eventId, attendeeId }` pairs in `data.json` - an attendee can appear in many events, and an event can have many attendees.

## Resetting your data

If you want to start over, stop the server and replace the contents of `data.json` with:
```json
{
  "users": [],
  "events": [],
  "attendees": [],
  "registrations": []
}
```
The admin user will be re-created automatically the next time you run `npm start`.
