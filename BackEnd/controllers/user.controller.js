const { validationResult } = require('express-validator');
const db = require('../Db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserData = require('../models/schema'); 

module.exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const checkQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkQuery, [email], async (err, existingUsers) => {
        if (err) {
            console.error("DB Check Error:", err);
            return res.status(500).json({ error: "Database error on checking user" });
        }

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";

            db.query(insertQuery, [username, email, hashedPassword], (err, insertResult) => {
                if (err) {
                    console.error("Insert Error:", err);
                    return res.status(500).json({ error: "Database error on insert" });
                }

                const userId = insertResult.insertId;

                const updateLoginCountQuery = "UPDATE users SET login_count = login_count + 1 WHERE id = ?";
                db.query(updateLoginCountQuery, [userId], (err2) => {
                    if (err2) {
                        console.error("Login count update error:", err2);
                        return res.status(500).json({ error: "Error updating login count" });
                    }

                    // Now fetch the user with updated login_count
                    const getUserQuery = "SELECT id, username, email, login_count FROM users WHERE id = ?";
                    db.query(getUserQuery, [userId], (err3, result) => {
                        if (err3) {
                            console.error("User fetch error:", err3);
                            return res.status(500).json({ error: "Error fetching user data" });
                        }

                        const user = result[0];

                        // Create token
                        const token = jwt.sign(
                            { id: user.id, username: user.username, email: user.email },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        // Send token and user data
                        res.cookie('token', token, { httpOnly: true });
                        return res.status(201).json({
                            message: "User registered successfully",
                            token,
                            user
                        });
                    });
                });
            });
        } catch (hashError) {
            console.error("Hashing Error:", hashError);
            return res.status(500).json({ error: "Password hashing failed" });
        }
    });
};

// Login User
module.exports.loginUser = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error("DB Query Error:", err);
            return res.status(500).json({ error: "Database error on login" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const updateLoginCountQuery = "UPDATE users SET login_count = login_count + 1 WHERE id = ?";
        db.query(updateLoginCountQuery, [user.id], (err2) => {
            if (err2) {
                console.error("Login count update error:", err2);
                return res.status(500).json({ error: "Error updating login count" });
            }
            // Create token
            const token = jwt.sign(
                { id: user.id, username: user.username, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, { httpOnly: true });
            return res.status(200).json({
                message: "Login successful", token, user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    login_count: user.login_count
                }
            });
        });
    });
};

module.exports.onBoarding = async(req, res) => {
    try {
        const { monthlyIncome, currency, primaryGoal, budgetPreference, expenseCategories } = req.body;
        const email = req.user.email;

        const userData = await UserData.findOneAndUpdate(
            { email },
            {
                email,
                monthlyIncome,
                currency,
                primaryGoal,
                budgetPreference,
                expenseCategories
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ message: 'Onboarding step 2 saved', data: userData });
    } catch (err) {
        console.error('Onboarding error:', err);
        res.status(500).json({ message: 'Server error during onboarding' });

    }
}


// Get Profile
module.exports.getProfile = (req, res) => {
    res.status(200).json({ user: req.user });
};

module.exports.logOut = (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const BlackListedQuery = 'INSERT INTO blacklist_tokens (token) VALUES (?)';

    db.query(BlackListedQuery, [token], (err, result) => {
        if (err) {
            console.error("DB Query Error:", err);
            return res.status(500).json({ error: "Database error on token blacklist" });
        }

        res.clearCookie('token');
        return res.status(200).json({ message: 'Logged out successfully' });
    });
}
