const { Server } = require("socket.io");

let io;

/**
 * Initialize Socket.io instance
 * @param {Object} server - HTTP Server instance
 */
const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Client connected to real-time feed: ${socket.id}`);

    // Allow security analysts to join specific monitoring rooms
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get initialized Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Helper to emit real-time threat alerts to connected clients
 * @param {Object} alertData - Intrusion alert details
 */
const emitNewAlert = (alertData) => {
  if (io) {
    io.emit("new_alert", alertData);
    console.log(`📡 Real-time alert emitted for ${alertData.attackType}`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNewAlert,
};