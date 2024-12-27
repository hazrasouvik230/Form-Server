const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require("../models/User.model");

// Register
router.post("/signup", async (req, res) => {
    const {name, email, password} = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({message: 'All fields are required!'});
        }

        const isUserExist = await UserModel.findOne({email});
        if (isUserExist) {
            return res.status(400).json({message: "User is already exist!"});
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long!' });
        }

        const hashedPassword = await bcrypt.hashSync(password, 10);

        const newUser = new UserModel({name, email, password: hashedPassword});
        await newUser.save();

        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});

        return res.status(200).json({message: 'User registered successfully!', id: newUser._id, token});
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message});
    }
});

// Login
router.post("/signin", async (req, res) => {
    const {email, password} = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({message: 'All fields are required!'});
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long!' });
        }

        const isEmailExist = await UserModel.findOne({email});
        if (!isEmailExist) {
            return res.status(400).json({message: "Invalid email!"});
        }

        const isCorrectPassword = await bcrypt.compare(password, isEmailExist.password);
        if (!isCorrectPassword) {
            return res.status(400).json({message: "Incorrect password!"});
        }

        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: "1h"});

        return res.status(200).json({message: "User login successfully!", id: isEmailExist._id, name: isEmailExist.name, token});
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message});
    }
});

// logout
router.post("/logout/:id", async (req, res) => {
    try {
        return res.status(200).json({message: "User logout successfully!"});
    } catch (error) {
        return res.status(500).json({message: 'Internal server error', error: error.message});
    }
});

// Middleware to verify token and extract user info
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details (e.g., email or id) to req
    next();
} catch (error) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
}
};

// Update
router.put("/profile", verifyToken, async (req, res) => {
    const { name, email, oldPassword, newPassword } = req.body;
    const { email: userEmail } = req.user; // Extract email from token

    try {
        // Fetch the user from the database
        const user = await UserModel.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the new email is unique (if an email update is requested)
        if (email && email !== userEmail) {
            const emailExists = await UserModel.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use" });
            }
        }

        // Validate and update the password
        if (oldPassword || newPassword) {
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: "Both old and new passwords are required to update the password" });
            }

            // Verify the old password
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                return res.status(400).json({ message: "Incorrect old password" });
            }

            // Check new password length
            if (newPassword.length < 8) {
                return res.status(400).json({ message: "New password must be at least 8 characters long" });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedNewPassword;
        }

        // Update the name or email if provided
        if (name) user.name = name;
        if (email) user.email = email;

        // Save the updated user to the database
        await user.save();

        res.status(200).json({ message: "Profile updated successfully", data: user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
});


module.exports = router;