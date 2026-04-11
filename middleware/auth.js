const jwt = require('jsonwebtoken');

const JWT_SECRET = "12312312";

function setUser(user) {
    return jwt.sign({
        id: user._id,
        email: user.email
    }, JWT_SECRET);
}

function getUser(token) {
    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.log("Token verification failed:", err.message);
        return null;
    }
}


module.exports = { setUser, getUser }