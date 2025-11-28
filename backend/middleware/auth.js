const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    console.log('\n🔐 AUTH MIDDLEWARE CHECKING...');
    console.log('- Session:', req.session ? 'EXISTS' : 'MISSING');
    console.log('- Cookies:', req.cookies ? Object.keys(req.cookies) : 'NONE');
    console.log('- Session user:', req.session?.user ? req.session.user.email : 'NONE');

    // METHOD 1: Check for user in session
    if (req.session && req.session.user) {
      req.user = {
        id: req.session.user._id || req.session.user.id,
        _id: req.session.user._id || req.session.user.id,
        email: req.session.user.email,
        fullName: req.session.user.fullName || req.session.user.name,
        name: req.session.user.fullName || req.session.user.name,
        role: req.session.user.role,
      };
    } else if (req.cookies && req.cookies.user) {
      // METHOD 2: Check for user cookie
      try {
        const userData =
          typeof req.cookies.user === 'string'
            ? JSON.parse(req.cookies.user)
            : req.cookies.user;

        req.user = {
          id: userData._id || userData.id,
          _id: userData._id || userData.id,
          email: userData.email,
          fullName: userData.fullName || userData.name,
          name: userData.fullName || userData.name,
          role: userData.role,
        };
      } catch (parseError) {
        console.error('❌ Failed to parse user cookie:', parseError);
      }
    } else if (req.user && req.user.id) {
      // METHOD 3: Already set
      console.log(
        '✅ Auth middleware: User already set:',
        req.user.fullName || req.user.email
      );
    }

    // ⚠️ DEV MODE BYPASS (optional)
    if (!req.user && process.env.NODE_ENV !== 'production') {
      console.log(
        '⚠️ DEV MODE: Allowing request without auth (using default admin user)'
      );
      req.user = {
        id: '000000000000000000000000',
        _id: '000000000000000000000000',
        email: 'admin@gmail.com',
        fullName: 'Admin User',
        name: 'Admin User',
        role: 'admin',
      };
    }

    // flag if this is the fake dev admin
    const isDevFakeUser =
      process.env.NODE_ENV !== 'production' &&
      req.user &&
      req.user._id === '000000000000000000000000';

    // Still no user? -> 401
    if (!req.user) {
      console.log('❌ Auth middleware: No user found in session/cookies');
      console.log('❌ Request path:', req.path);
      console.log('❌ Request method:', req.method);
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to continue',
      });
    }

    // ✅ Check banned status from DB (skip for dev fake user)
    if (!isDevFakeUser) {
      try {
        const dbUser = await User.findById(req.user._id).select(
          'isBanned banReason bannedAt role fullName email'
        );

        if (!dbUser) {
          return res.status(401).json({ error: 'User not found' });
        }

        if (dbUser.isBanned) {
          console.log('⛔ BANNED USER BLOCKED:', dbUser.email);
          return res.status(403).json({
            error: 'Account banned',
            message:
              dbUser.banReason ||
              'Your account has been suspended. Please contact the administration.',
            bannedAt: dbUser.bannedAt,
          });
        }

        // Keep latest role/name from DB
        req.user.role = dbUser.role;
        req.user.fullName = dbUser.fullName;
        req.user.email = dbUser.email;
      } catch (dbErr) {
        console.error('❌ Auth middleware DB error:', dbErr);
        return res.status(500).json({ error: 'Auth check failed' });
      }
    }

    return next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

// Optional auth (unchanged, no ban block – just used for public pages)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      req.user = {
        id: req.session.user._id || req.session.user.id,
        _id: req.session.user._id || req.session.user.id,
        email: req.session.user.email,
        fullName: req.session.user.fullName || req.session.user.name,
        name: req.session.user.fullName || req.session.user.name,
        role: req.session.user.role,
      };
      console.log('✅ Optional auth: User found:', req.user.fullName);
    } else if (req.cookies && req.cookies.user) {
      const userData =
        typeof req.cookies.user === 'string'
          ? JSON.parse(req.cookies.user)
          : req.cookies.user;

      req.user = {
        id: userData._id || userData.id,
        _id: userData._id || userData.id,
        email: userData.email,
        fullName: userData.fullName || userData.name,
        name: userData.fullName || userData.name,
        role: userData.role,
      };
      console.log('✅ Optional auth: User found from cookie:', req.user.fullName);
    } else {
      console.log('ℹ️ Optional auth: No user found, continuing anyway');
    }

    return next();
  } catch (error) {
    console.error('❌ Optional auth middleware error:', error);
    return next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuthMiddleware;
