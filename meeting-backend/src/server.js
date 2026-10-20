const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const contactsRoutes = require("./routes/contactsRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());


// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/meetings", meetingRoutes);

app.use("/api/contacts", contactsRoutes);


// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "IntellMeet Backend is running"
    });
});


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

connectDB();

server.listen(PORT, () => {
    console.log(`IntellMeet server running on port ${PORT}`);
});


 // ===============================
 // SOCKET.IO
 // ===============================
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const joinRoom = async (roomId, displayName = "Guest") => {
        if (!roomId) return;

        const room = String(roomId);
        const alreadyJoined = socket.rooms.has(room);
        socket.data.roomId = room;
        socket.data.displayName = displayName;

        await socket.join(room);

        if (alreadyJoined) return;

        const users = await io.in(room).fetchSockets();
        const otherUsers = users
            .filter((user) => user.id !== socket.id)
            .map((user) => ({
                socketId: user.id,
                displayName: user.data.displayName || "Guest"
            }));

        socket.emit("room-users", otherUsers);

        socket.to(room).emit("user-joined", {
            socketId: socket.id,
            displayName
        });

        console.log(`Socket ${socket.id} joined meeting ${room}`);
    };

    socket.on("join-room", ({ roomId, displayName } = {}) => {
        joinRoom(roomId, displayName);
    });

    socket.on("join-meeting", (meetingId) => {
        joinRoom(meetingId);
    });

    const leaveRoom = async (roomId) => {
        const room = String(roomId || socket.data.roomId || "");
        if (!room || !socket.rooms.has(room)) return;

        await socket.leave(room);
        socket.to(room).emit("user-left", { socketId: socket.id });
        console.log(`Socket ${socket.id} left meeting ${room}`);
    };

    socket.on("leave-room", () => leaveRoom());
    socket.on("leave-meeting", (meetingId) => leaveRoom(meetingId));

    socket.on("send-message", ({ meetingId, message } = {}) => {
        if (!meetingId || !message) return;
        socket.to(String(meetingId)).emit("receive-message", {
            socketId: socket.id,
            message,
            timestamp: new Date()
        });
    });

    socket.on("chat-message", (data) => {
        const room = socket.data.roomId;
        if (!room || !data?.text) return;
        socket.to(room).emit("chat-message", {
            socketId: socket.id,
            text: data.text
        });
    });

    socket.on("webrtc-offer", ({ meetingId, targetSocketId, to, offer } = {}) => {
        const target = targetSocketId || to;
        if (!target || !offer) return;
        io.to(target).emit("webrtc-offer", {
            from: socket.id,
            offer
        });
    });

    socket.on("webrtc-answer", ({ targetSocketId, to, answer } = {}) => {
        const target = targetSocketId || to;
        if (!target || !answer) return;
        io.to(target).emit("webrtc-answer", {
            from: socket.id,
            answer
        });
    });

    socket.on("webrtc-ice-candidate", ({ targetSocketId, to, candidate } = {}) => {
        const target = targetSocketId || to;
        if (!target || !candidate) return;
        io.to(target).emit("webrtc-ice-candidate", {
            from: socket.id,
            candidate
        });
    });

    socket.on("disconnect", () => {
        const room = socket.data.roomId;
        if (room) {
            socket.to(room).emit("user-left", { socketId: socket.id });
        }
        console.log("User disconnected:", socket.id);
    });
});