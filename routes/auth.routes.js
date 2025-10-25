
const express = require('express');
const router = express.Router();
const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.middleware.js');

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    await User.create({ email, password });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Ensure JWT_SECRET is present
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET not set in .env file");
            return res.status(500).json({ error: "Internal server error: JWT secret not configured" });
        }

        const payload = { user: { email: user.email } };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        res.json({ token });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /auth/session - Protected Route
router.get('/session', authMiddleware, async (req, res) => {
    try {
        // The authMiddleware has already verified the token and attached the user to the request.
        // We can optionally fetch fresh user data from the database if needed,
        // but for session restoration, returning the user info from the token is sufficient.
        res.json({ user: req.user });
    } catch (error) {
        console.error('Session Restore Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
