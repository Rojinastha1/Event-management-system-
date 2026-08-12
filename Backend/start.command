#!/bin/bash
# start.command
# Double-click this file to start the Event Management System server.
# A Terminal window will open - keep it open while you use the app,
# then open http://localhost:3000 in your browser.
#
# If you see "EADDRINUSE", the server is already running (see the note below).

cd "$(dirname "$0")"

# If the server is already answering on port 3000, just open the browser
# instead of failing. (Probing the endpoint is safer than checking the port,
# because it only matches *our* server - not some other program on port 3000.)
if curl -s -m 2 http://localhost:3000/api/login >/dev/null 2>&1; then
  echo "The server is already running."
  open http://localhost:3000
  exit 0
fi

npm start
