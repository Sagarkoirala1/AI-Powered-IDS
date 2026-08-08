require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/database");
const { initSocket } = require("./sockets/socket");

// Connect Database
connectDB();

// Create HTTP Server for WebSockets + Express
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` WebSocket server active on ws://localhost:${PORT}`);
});