const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Folder = require("../models/Folder.model");
const User = require("../models/User.model");

// Authentications
const authenticate = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user;
        next();
    } catch (error) {
      return res.status(403).json({ message: "Invalid or Expired Token" });
    }
};

// Create a new folder
// router.post("/folder", authenticate, async (req, res) => {
router.post("/createfolder", authenticate, async (req, res) => {
    try {
      const { name } = req.body;
  
      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Folder name is required" });
      }
  
      // Check for duplicate folder names under the same user
      const existingFolder = await Folder.findOne({ name, user_id: req.user._id });
      if (existingFolder) {
        return res.status(400).json({ message: "Folder name already exists" });
      }
  
      const newFolder = new Folder({ name, user_id: req.user._id });
      const savedFolder = await newFolder.save();
  
      res.status(201).json({ message: "Folder created successfully", folder: savedFolder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong", error: error.message });
    }
});

// Delete a folder
// router.delete("/folder/:id", verifyToken, async (req, res) => {
router.delete("/deletefolder/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
      const folder = await FolderModel.findByIdAndDelete(id);

      if (!folder) {
          return res.status(404).json({ message: "Folder not found" });
      }

      res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Failed to delete folder", error: error.message });
  }
});

module.exports = router;