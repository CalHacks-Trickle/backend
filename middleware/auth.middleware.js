
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if not token
    if (!authHeader) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    // Check if the token is in the correct format 'Bearer <token>'
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Token is not valid' });
    }

    const token = tokenParts[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
}

module.exports = authMiddleware;
