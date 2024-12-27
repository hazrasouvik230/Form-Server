const express = require("express");
const router = express.Router();
const Folder = require("../models/Folder.model");

// Create a folder
router.post("/", async (req, res) => {
    const { name, user_id } = req.body;

    if (!name || !user_id) {
        return res.status(400).json({ message: "Folder name and user_id are required." });
    }

    try {
        const folder = new Folder({ name, user_id });
        await folder.save();
        res.status(201).json({ message: "Folder created successfully", folder });
    } catch (error) {
        res.status(500).json({ message: "Error creating folder", error });
    }
});

// Delete a folder
router.delete("/:id", async (req, res) => {
    try {
        await Folder.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete folder", error });
    }
});

module.exports = router;