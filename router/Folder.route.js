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
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};

// Create a new folder
router.post("/", authenticate, async (req, res) => {
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
  
      const newFolder = new Folder({
        name,
        user_id: req.user._id,
      });
  
      const savedFolder = await newFolder.save();
      res.status(201).json(savedFolder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
});

// Delete a folder
router.delete("/:id", authenticate, async (req, res) => {
    try {
      const folderId = req.params.id;
      const folder = await Folder.findOne({ _id: folderId, user_id: req.user._id });
  
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
  
      await Folder.deleteOne({ _id: folderId });
      res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
});

module.exports = router;