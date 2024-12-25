const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require("../models/User.model");

// Register
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
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

        return res.status(200).json({message: "User login successfully!", id: isEmailExist._id, token});
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

module.exports = router;