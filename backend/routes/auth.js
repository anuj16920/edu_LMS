const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// HARD-CODED BACKEND REDIRECT URL (must match Google Console!)
const BACKEND_REDIRECT_URI = 'http://localhost:5000/api/auth/google/callback';

// Google OAuth client
const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  BACKEND_REDIRECT_URI
);

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    console.log('📝 Register request:', { email, fullName, role });

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (!role || !['admin', 'faculty', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, faculty, or student' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      role
    });

    await user.save();
    console.log('✅ User created:', { id: user._id, email: user.email, role: user.role });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login request:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Please use Google login for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Login successful:', { id: user._id, email: user.email, role: user.role });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATED: Google Auth - Get Google Login URL (with role parameter)
router.get('/google/url', (req, res) => {
  try {
    const { role } = req.query; // ✅ Get role from query
    console.log('🔗 Generating Google auth URL for role:', role || 'student');

    const authUrl = googleOAuthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['profile', 'email'],
      redirect_uri: BACKEND_REDIRECT_URI,
      state: role || 'student' // ✅ Pass role in state parameter
    });

    res.json({ url: authUrl });
  } catch (error) {
    console.error('❌ Google URL error:', error);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
});

// ✅ UPDATED: Google Auth - Callback (extract role from state)
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query; // ✅ Get both code and state (role)
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code received' });
    }

    const selectedRole = state || 'student'; // ✅ Get role from state or default to student
    console.log('📥 Google callback received, code:', String(code).substring(0, 20) + '...');
    console.log('👤 Selected role:', selectedRole);

    // Exchange code for tokens
    const { tokens } = await googleOAuthClient.getToken({
      code,
      redirect_uri: BACKEND_REDIRECT_URI
    });

    // Verify ID token
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Google user verified:', { email: payload.email, googleId: payload.sub });

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email }]
    });

    if (!user) {
      // ✅ New Google user - use selected role from frontend
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name || payload.email.split('@')[0],
        role: selectedRole, // ✅ Use selected role instead of hardcoded 'student'
        avatarUrl: payload.picture,
        isVerified: true
      });
      await user.save();
      console.log('✅ New Google user created:', { id: user._id, email: user.email, role: user.role });
    } else if (!user.googleId) {
      // Existing email/password user - link Google
      user.googleId = payload.sub;
      user.avatarUrl = user.avatarUrl || payload.picture;
      user.isVerified = true;
      await user.save();
      console.log('✅ Google account linked:', { id: user._id, email: user.email, role: user.role });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token & user
    const frontendUrl = `${process.env.FRONTEND_URL}/login/success?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      })
    )}`;

    return res.redirect(frontendUrl);
  } catch (error) {
    console.error('❌ Google callback error:', error);
    return res.status(400).json({ error: 'Google authentication failed' });
  }
});

// Get Current User Route
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
