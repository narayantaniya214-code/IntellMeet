const express = require("express");
const crypto = require("crypto");
const Meeting = require("../models/Meeting");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a meeting
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, scheduledAt } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Meeting title is required"
            });
        }

        const meetingId = crypto.randomBytes(6).toString("hex");

        const meeting = await Meeting.create({
            title,
            description,
            host: req.user.id,
            meetingId,
            scheduledAt
        });

        res.status(201).json({
            message: "Meeting created successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create meeting",
            error: error.message
        });
    }
});

// Get all meetings of logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const meetings = await Meeting.find({
            host: req.user.id
        }).sort({ createdAt: -1 });

        res.json({
            message: "Meetings fetched successfully",
            meetings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch meetings",
            error: error.message
        });
    }
});

//get one meeting by meetingId
router.get("/:meetingId", authMiddleware, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            meetingId: req.params.meetingId
        });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        const isHost = meeting.host.toString() === req.user.id;

        const isParticipant = meeting.participants.some(
            participant => participant.toString() === req.user.id
        );

        if (!isHost && !isParticipant) {
            return res.status(403).json({
                message: "You are not allowed to access this meeting"
            });
        }

        res.json({
            message: "Meeting fetched successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch meeting",
            error: error.message
        });
    }
});

// Delete a meeting
router.delete("/:meetingId", authMiddleware, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            meetingId: req.params.meetingId
        });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        if (meeting.host.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to delete this meeting"
            });
        }

        await Meeting.deleteOne({
            meetingId: req.params.meetingId
        });

        res.json({
            message: "Meeting deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete meeting",
            error: error.message
        });
    }
});

// Update a meeting
router.put("/:meetingId", authMiddleware, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            meetingId: req.params.meetingId
        });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        if (meeting.host.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to update this meeting"
            });
        }

        const { title, description, scheduledAt, status } = req.body;

        if (title !== undefined) meeting.title = title;
        if (description !== undefined) meeting.description = description;
        if (scheduledAt !== undefined) meeting.scheduledAt = scheduledAt;
        if (status !== undefined) meeting.status = status;

        await meeting.save();

        res.json({
            message: "Meeting updated successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update meeting",
            error: error.message
        });
    }
});

// Join a meeting
router.post("/:meetingId/join", authMiddleware, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            meetingId: req.params.meetingId
        });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        const alreadyJoined = meeting.participants.some(
            participant => participant.toString() === req.user.id
        );

        if (alreadyJoined) {
            return res.status(400).json({
                message: "You have already joined this meeting"
            });
        }

        meeting.participants.push(req.user.id);

        await meeting.save();

        res.json({
            message: "Joined meeting successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to join meeting",
            error: error.message
        });
    }
});

// Leave a meeting
router.post("/:meetingId/leave", authMiddleware, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            meetingId: req.params.meetingId
        });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        const participantIndex = meeting.participants.findIndex(
            participant => participant.toString() === req.user.id
        );

        if (participantIndex === -1) {
            return res.status(400).json({
                message: "You are not a participant of this meeting"
            });
        }

        meeting.participants.splice(participantIndex, 1);

        await meeting.save();

        res.json({
            message: "Left meeting successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to leave meeting",
            error: error.message
        });
    }
});

// Update meeting status
router.patch("/:meetingId/status", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ["scheduled", "live", "ended"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid meeting status"
            });
        }

        const meeting = await Meeting.findOne({
            meetingId: req.params.meetingId
        });

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        if (meeting.host.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Only the meeting host can change the status"
            });
        }

        meeting.status = status;

        await meeting.save();

        res.json({
            message: "Meeting status updated successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update meeting status",
            error: error.message
        });
    }
});

module.exports = router;