const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

// CREATE CONTACT
router.post("/", async (req, res) => {
    try {
        const { owner, name, email, phone, company, role } = req.body;

        if (!owner || !name || !email) {
            return res.status(400).json({
                message: "Owner, name and email are required"
            });
        }

        const contact = await Contact.create({
            owner,
            name,
            email,
            phone,
            company,
            role
        });

        res.status(201).json({
            message: "Contact created successfully",
            contact
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create contact",
            error: error.message
        });
    }
});

// GET ALL CONTACTS FOR A USER
router.get("/:ownerId", async (req, res) => {
    try {
        const contacts = await Contact.find({
            owner: req.params.ownerId
        }).sort({ createdAt: -1 });

        res.json(contacts);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch contacts",
            error: error.message
        });
    }
});

// GET ONE CONTACT
router.get("/single/:id", async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch contact",
            error: error.message
        });
    }
});

// UPDATE CONTACT
router.put("/:id", async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        res.json({
            message: "Contact updated successfully",
            contact
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update contact",
            error: error.message
        });
    }
});

// DELETE CONTACT
router.delete("/:id", async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(
            req.params.id
        );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found"
            });
        }

        res.json({
            message: "Contact deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete contact",
            error: error.message
        });
    }
});

module.exports = router;