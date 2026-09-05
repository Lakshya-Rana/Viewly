import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import http from "http";

import roomRouter from "./routes/rooms.routes.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5175",
    credentials: true,
  },
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5175"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
  })
);

// Track active screen presenter per room
const roomPresenters = {};

io.on("connection", (socket) => {
  // Join room
  socket.on("join-room", ({ roomId, displayName }) => {
    socket.join(roomId);

    socket.data.roomId = roomId;
    socket.data.displayName = displayName;

    const participants = [];
    const room = io.sockets.adapter.rooms.get(roomId);

    if (room) {
      room.forEach((socketId) => {
        const participantSocket = io.sockets.sockets.get(socketId);
        if (participantSocket) {
          participants.push({
            socketId,
            displayName: participantSocket.data.displayName,
            isMicOn: !!participantSocket.data.isMicOn,
          });
        }
      });
    }

    socket.emit("room-participants", participants);
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      displayName,
      isMicOn: false,
    });

    // Notify newly joined user if someone is currently sharing screen
    if (roomPresenters[roomId]) {
      socket.emit("screen-share-started", {
        presenterSocketId: roomPresenters[roomId].socketId,
        displayName: roomPresenters[roomId].displayName,
      });
    }
  });

  // Chat message
  socket.on("send-message", ({ roomId, displayName, message }) => {
    io.to(roomId).emit("receive-message", {
      socketId: socket.id,
      displayName,
      message,
    });
  });

  // Start Screen Share
  socket.on("start-screen-share", ({ roomId, displayName }) => {
    if (roomPresenters[roomId] && roomPresenters[roomId].socketId !== socket.id) {
      return socket.emit("screen-share-error", {
        message: `${roomPresenters[roomId].displayName} is already sharing screen.`,
      });
    }

    roomPresenters[roomId] = { socketId: socket.id, displayName };

    io.to(roomId).emit("screen-share-started", {
      presenterSocketId: socket.id,
      displayName,
    });
  });

  // Viewer requests stream from presenter
  socket.on("request-screen-stream", ({ presenterSocketId }) => {
    io.to(presenterSocketId).emit("request-screen-stream", {
      viewerSocketId: socket.id,
    });
  });

  // Stop Screen Share
  socket.on("stop-screen-share", ({ roomId }) => {
    if (roomPresenters[roomId] && roomPresenters[roomId].socketId === socket.id) {
      delete roomPresenters[roomId];
      io.to(roomId).emit("screen-share-stopped");
    }
  });

  // Voice Call State Change
  socket.on("voice-state-changed", ({ roomId, isMicOn }) => {
    socket.data.isMicOn = isMicOn;
    socket.to(roomId).emit("user-voice-state-changed", {
      socketId: socket.id,
      isMicOn,
    });
  });

  // WebRTC Signaling Relays (Screen Share)
  socket.on("webrtc-offer", ({ targetSocketId, offer, senderSocketId }) => {
    io.to(targetSocketId).emit("webrtc-offer", { offer, senderSocketId });
  });

  socket.on("webrtc-answer", ({ targetSocketId, answer, senderSocketId }) => {
    io.to(targetSocketId).emit("webrtc-answer", { answer, senderSocketId });
  });

  socket.on("webrtc-ice-candidate", ({ targetSocketId, candidate, senderSocketId }) => {
    io.to(targetSocketId).emit("webrtc-ice-candidate", { candidate, senderSocketId });
  });

  // WebRTC Signaling Relays (Audio Voice Call)
  socket.on("audio-webrtc-offer", ({ targetSocketId, offer, senderSocketId }) => {
    io.to(targetSocketId).emit("audio-webrtc-offer", { offer, senderSocketId });
  });

  socket.on("audio-webrtc-answer", ({ targetSocketId, answer, senderSocketId }) => {
    io.to(targetSocketId).emit("audio-webrtc-answer", { answer, senderSocketId });
  });

  socket.on("audio-webrtc-ice-candidate", ({ targetSocketId, candidate, senderSocketId }) => {
    io.to(targetSocketId).emit("audio-webrtc-ice-candidate", { candidate, senderSocketId });
  });

  // User disconnected
  socket.on("disconnect", () => {
    const { roomId } = socket.data;

    if (roomId) {
      socket.to(roomId).emit("user-left", {
        socketId: socket.id,
      });

      if (roomPresenters[roomId] && roomPresenters[roomId].socketId === socket.id) {
        delete roomPresenters[roomId];
        io.to(roomId).emit("screen-share-stopped");
      }
    }
  });
});

app.use("/rooms", roomRouter);

export { app, server, io };
