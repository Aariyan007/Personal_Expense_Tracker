const jwt = require('jsonwebtoken');
const db = require('../Db/db');

module.exports.authUser = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const BlackListedQuery = 'SELECT * FROM blacklist_tokens WHERE token = ?';

    db.query(BlackListedQuery, [token], (err, result) => {
        if (err) {
            console.error("DB Query Error:", err);
            return res.status(500).json({ error: "Database error on token check" });
        }

        if (result.length > 0) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            req.user = decoded; // Save decoded info to request
            next();
        });
    });
};
