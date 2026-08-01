const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// POST: Register a new user
router.post(['/register', '/signup'], registerUser);

// POST: Login a user
router.post(['/signin', '/login'], loginUser);

module.exports = router;