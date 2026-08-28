const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST: Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, cvLink } = req.body;

        // 1. Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Prevent hacking admin role
        if (role === 'admin') {
            return res.status(403).json({ message: 'Cannot register as admin' });
        }

        // 2. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the new user object
        const isInstructor = role === 'instructor';
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            accountStatus: isInstructor ? 'Pending' : 'Approved',
            cvLink: isInstructor ? cvLink : ''
        });

        // 4. Save the user to MongoDB Atlas
        await newUser.save();
        res.status(201).json({ message: 'User successfully created!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// POST: Login a user
const loginUser = async (req, res) => {
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

        // 3. Prevent login if the instructor is still pending approval
        if (user.accountStatus === 'Pending') {
            return res.status(403).json({ message: 'Your account is still under review by the Admin. Please wait for the confirmation email.' });
        }
        if (user.accountStatus === 'Rejected') {
            return res.status(403).json({ message: 'Your application to become an instructor was not approved.' });
        }

        // 4. Generate a JWT Token
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        // 4. Send the token and user data back to the frontend
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                tokens: user.tokens
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser
};
