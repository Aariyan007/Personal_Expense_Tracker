const { validationResult } = require('express-validator');
const db = require('../Db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserData = require('../models/schema'); 

// Existing registration code...
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

                    const getUserQuery = "SELECT id, username, email, login_count FROM users WHERE id = ?";
                    db.query(getUserQuery, [userId], (err3, result) => {
                        if (err3) {
                            console.error("User fetch error:", err3);
                            return res.status(500).json({ error: "Error fetching user data" });
                        }

                        const user = result[0];
                        const token = jwt.sign(
                            { id: user.id, username: user.username, email: user.email },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

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

// Existing login code...
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
            
            const token = jwt.sign(
                { id: user.id, username: user.username, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.cookie('token', token, { httpOnly: true });
            return res.status(200).json({
                message: "Login successful", 
                token, 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    login_count: user.login_count + 1
                }
            });
        });
    });
};

// Existing onboarding...
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

module.exports.getUserDetails = async (req, res) => {
    try {
        const email = req.user.email;
        
        // Get user data from MongoDB
        const userData = await UserData.findOne({ email });
        
        if (!userData) {
            return res.status(404).json({ error: 'User data not found. Please complete onboarding.' });
        }

        // Combine with user info from token
        const userDetails = {
            name: req.user.username,
            email: req.user.email,
            monthlyIncome: parseFloat(userData.monthlyIncome) || 0,
            currency: userData.currency || 'USD',
            primaryGoal: userData.primaryGoal || '',
            budgetPreference: userData.budgetPreference || '',
            expenseCategories: userData.expenseCategories || []
        };

        res.status(200).json(userDetails);
    } catch (err) {
        console.error('Get user details error:', err);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};


module.exports.getMonthlySummary = async (req, res) => {
    try {
        const email = req.user.email;
        const userData = await UserData.findOne({ email });
        
        if (!userData) {
            return res.status(404).json({ error: 'User data not found' });
        }

        const income = parseFloat(userData.monthlyIncome) || 0;
        
        // Mock data - replace with actual transaction calculations
        const mockSummary = {
            income: income,
            spent: Math.floor(income * 0.6), // 60% spent
            budget: Math.floor(income * 0.8), // 80% budget
            savings: Math.floor(income * 0.2)  // 20% saved
        };

        res.status(200).json(mockSummary);
    } catch (err) {
        console.error('Get monthly summary error:', err);
        res.status(500).json({ error: 'Failed to fetch monthly summary' });
    }
};

// Get recent transactions (mock data)
module.exports.getRecentTransactions = async (req, res) => {
    try {
        const userData = await UserData.findOne({ email: req.user.email });
        const currency = userData?.currency || 'USD';
        
        // Mock transactions - replace with actual database queries
        const mockTransactions = [
            {
                id: 1,
                desc: 'Grocery Shopping',
                amount: -85.50,
                type: 'expense',
                date: '2 hours ago',
                category: 'Food'
            },
            {
                id: 2,  
                desc: 'Salary Deposit',
                amount: 3500.00,
                type: 'income',
                date: '1 day ago',
                category: 'Income'
            },
            {
                id: 3,
                desc: 'Coffee Shop',
                amount: -12.75,
                type: 'expense', 
                date: '2 days ago',
                category: 'Food'
            },
            {
                id: 4,
                desc: 'Gas Station',
                amount: -45.20,
                type: 'expense',
                date: '3 days ago', 
                category: 'Transportation'
            }
        ];

        res.status(200).json(mockTransactions);
    } catch (err) {
        console.error('Get recent transactions error:', err);
        res.status(500).json({ error: 'Failed to fetch recent transactions' });
    }
};

// Get category spending (mock data based on user categories)
module.exports.getCategorySpending = async (req, res) => {
    try {
        const userData = await UserData.findOne({ email: req.user.email });
        
        if (!userData) {
            return res.status(404).json({ error: 'User data not found' });
        }

        const income = parseFloat(userData.monthlyIncome) || 5000;
        const categories = userData.expenseCategories || ['Food', 'Transportation', 'Entertainment'];
        
        // Mock category spending data
        const categorySpending = categories.map((category, index) => {
            const budgetPercentage = [0.3, 0.2, 0.15, 0.1, 0.1][index] || 0.1;
            const spentPercentage = budgetPercentage * (0.6 + Math.random() * 0.4); // 60-100% of budget
            
            return {
                category,
                budget: Math.floor(income * budgetPercentage),
                spent: Math.floor(income * spentPercentage),
                color: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][index % 5]
            };
        });

        res.status(200).json(categorySpending);
    } catch (err) {
        console.error('Get category spending error:', err);
        res.status(500).json({ error: 'Failed to fetch category spending' });
    }
};

// Get AI insights (mock personalized insights)
module.exports.getAIInsights = async (req, res) => {
    try {
        const userData = await UserData.findOne({ email: req.user.email });
        
        if (!userData) {
            return res.status(404).json({ error: 'User data not found' });
        }

        const goal = userData.primaryGoal;
        const budgetPref = userData.budgetPreference;
        
        // Generate insights based on user data
        const insights = [];
        
        if (goal === 'save') {
            insights.push({
                type: 'tip',
                message: 'You could save an extra $200 this month by reducing dining out expenses.',
                action: 'View Details'
            });
        }
        
        if (budgetPref === 'strict') {
            insights.push({
                type: 'success', 
                message: 'Great job! You\'re staying within your strict budget limits.',
                action: 'Keep Going'
            });
        }
        
        insights.push({
            type: 'warning',
            message: 'You\'ve spent 75% of your monthly budget. Consider reviewing upcoming expenses.',
            action: 'Review Budget'
        });

        insights.push({
            type: 'tip',
            message: `Based on your ${goal} goal, consider automating your savings.`,
            action: 'Set Up Auto-Save'
        });

        res.status(200).json(insights);
    } catch (err) {
        console.error('Get AI insights error:', err);
        res.status(500).json({ error: 'Failed to generate AI insights' });
    }
};

// Existing endpoints...
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