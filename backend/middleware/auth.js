const authMiddleware = (req, res, next) => {
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
        role: req.session.user.role
      };
      console.log('✅ Auth middleware: User authenticated from SESSION:', req.user.fullName);
      return next();
    }

    // METHOD 2: Check for user cookie
    if (req.cookies && req.cookies.user) {
      try {
        const userData = typeof req.cookies.user === 'string' 
          ? JSON.parse(req.cookies.user) 
          : req.cookies.user;
        
        req.user = {
          id: userData._id || userData.id,
          _id: userData._id || userData.id,
          email: userData.email,
          fullName: userData.fullName || userData.name,
          name: userData.fullName || userData.name,
          role: userData.role
        };
        console.log('✅ Auth middleware: User authenticated from COOKIE:', req.user.fullName);
        return next();
      } catch (parseError) {
        console.error('❌ Failed to parse user cookie:', parseError);
      }
    }

    // METHOD 3: Check if user was already set by another middleware
    if (req.user && req.user.id) {
      console.log('✅ Auth middleware: User already set:', req.user.fullName || req.user.email);
      return next();
    }

    // METHOD 4: Check for Authorization header (JWT)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // You can add JWT verification here if needed
      console.log('🔑 Auth middleware: Found bearer token (JWT verification not implemented)');
    }

    // ⚠️ DEVELOPMENT MODE: Allow unauthenticated access with default user
    // Comment this out in production!
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ DEV MODE: Allowing request without auth (using default admin user)');
      req.user = {
        id: '000000000000000000000000',
        _id: '000000000000000000000000',
        email: 'admin@gmail.com',
        fullName: 'Admin User',
        name: 'Admin User',
        role: 'admin'
      };
      return next();
    }

    // No authentication found
    console.log('❌ Auth middleware: No user found in session/cookies');
    console.log('❌ Request path:', req.path);
    console.log('❌ Request method:', req.method);
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to continue'
    });
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid authentication' });
  }
};

// Optional auth middleware - doesn't block request if no auth
const optionalAuthMiddleware = (req, res, next) => {
  try {
    // Try to authenticate but don't block if it fails
    if (req.session && req.session.user) {
      req.user = {
        id: req.session.user._id || req.session.user.id,
        _id: req.session.user._id || req.session.user.id,
        email: req.session.user.email,
        fullName: req.session.user.fullName || req.session.user.name,
        name: req.session.user.fullName || req.session.user.name,
        role: req.session.user.role
      };
      console.log('✅ Optional auth: User found:', req.user.fullName);
    } else if (req.cookies && req.cookies.user) {
      const userData = typeof req.cookies.user === 'string' 
        ? JSON.parse(req.cookies.user) 
        : req.cookies.user;
      
      req.user = {
        id: userData._id || userData.id,
        _id: userData._id || userData.id,
        email: userData.email,
        fullName: userData.fullName || userData.name,
        name: userData.fullName || userData.name,
        role: userData.role
      };
      console.log('✅ Optional auth: User found from cookie:', req.user.fullName);
    } else {
      console.log('ℹ️ Optional auth: No user found, continuing anyway');
    }
    
    return next();
  } catch (error) {
    console.error('❌ Optional auth middleware error:', error);
    return next(); // Continue anyway
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuthMiddleware;
