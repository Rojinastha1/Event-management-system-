// server.js
require("dotenv").config(); // Loads .env into process.env

const app = require("./app");
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.listen(PORT, () => {
  console.log(`Event Management System running at http://localhost:${PORT}`);
  console.log(`Configured Frontend URL: ${FRONTEND_URL}`);
});