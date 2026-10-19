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


    // ===========================
    // JOIN MEETING
    // ===========================

    socket.on("join-meeting", (meetingId) => {

        socket.join(meetingId);

        console.log(
            `Socket ${socket.id} joined meeting ${meetingId}`
        );

        socket.to(meetingId).emit("user-joined", {
            socketId: socket.id
        });
    });


    // ===========================
    // LEAVE MEETING
    // ===========================

    socket.on("leave-meeting", (meetingId) => {

        socket.leave(meetingId);

        console.log(
            `Socket ${socket.id} left meeting ${meetingId}`
        );

        socket.to(meetingId).emit("user-left", {
            socketId: socket.id
        });
    });


    // ===========================
    // CHAT MESSAGE
    // ===========================

    socket.on("send-message", (data) => {

        const { meetingId, message } = data;

        if (!meetingId || !message) {
            return;
        }

        socket.to(meetingId).emit("receive-message", {
            socketId: socket.id,
            message: message,
            timestamp: new Date()
        });
    });


    // ===========================
    // WEBRTC OFFER
    // ===========================

    socket.on("webrtc-offer", (data) => {

        const {
            meetingId,
            offer,
            targetSocketId
        } = data;

        if (!meetingId || !offer || !targetSocketId) {
            return;
        }

        io.to(targetSocketId).emit("webrtc-offer", {
            offer,
            senderSocketId: socket.id
        });
    });


    // ===========================
    // WEBRTC ANSWER
    // ===========================

    socket.on("webrtc-answer", (data) => {

        const {
            answer,
            targetSocketId
        } = data;

        if (!answer || !targetSocketId) {
            return;
        }

        io.to(targetSocketId).emit("webrtc-answer", {
            answer,
            senderSocketId: socket.id
        });
    });


    // ===========================
    // WEBRTC ICE CANDIDATE
    // ===========================

    socket.on("webrtc-ice-candidate", (data) => {

        const {
            candidate,
            targetSocketId
        } = data;

        if (!candidate || !targetSocketId) {
            return;
        }

        io.to(targetSocketId).emit(
            "webrtc-ice-candidate",
            {
                candidate,
                senderSocketId: socket.id
            }
        );
    });


    // ===========================
    // DISCONNECT
    // ===========================

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );
    });

});