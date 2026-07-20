const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Imports the schema you just made
const router = express.Router();

// POST: Register a new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the new user object
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // 4. Save the user to MongoDB Atlas
        await newUser.save();
        res.status(201).json({ message: 'User successfully created!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// POST: Login a user
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 2. Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 3. Generate a JWT Token
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 4. Send the token and user data back to the frontend
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ALWAYS AT THE VERY BOTTOM
module.exports = router;