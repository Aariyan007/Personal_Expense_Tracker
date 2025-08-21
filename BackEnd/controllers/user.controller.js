const { validationResult } = require('express-validator');
const db = require('../Db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserData = require('../models/schema'); 
const Expense = require('../models/ExpenseSchema'); 


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


module.exports.onBoarding = async(req, res) => {
    try {
        const { monthlyIncome, currency, primaryGoal, budgetPreference, expenseCategories } = req.body;
        const email = req.user.email;

        const userData = await UserData.findOneAndUpdate(
            { email },
            {
                email,
                monthlyIncome: parseFloat(monthlyIncome), 
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
        

        const userData = await UserData.findOne({ email });
        
        if (!userData) {
            return res.status(404).json({ error: 'User data not found. Please complete onboarding.' });
        }


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
            return res.status(404).json({
                success: false,
                error: 'User data not found'
            });
        }


        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);


        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: req.user.id, // Use MySQL user ID
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        let spent = 0;
        let additionalIncome = 0;

        monthlyExpenses.forEach(item => {
            if (item._id === 'expense') {
                spent = item.total;
            } else if (item._id === 'income') {
                additionalIncome = item.total;
            }
        });


        const baseIncome = parseFloat(userData.monthlyIncome) || 0;
        const totalIncome = baseIncome + additionalIncome;


        const budget = totalIncome * 0.8;
        const savings = totalIncome - spent;

        res.json({
            spent: Math.round(spent * 100) / 100,
            budget: Math.round(budget * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            income: Math.round(totalIncome * 100) / 100
        });

    } catch (err) {
        console.error('Get monthly summary error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch monthly summary'
        });
    }
};


module.exports.getRecentTransactions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const transactions = await Expense.find({ userId: req.user.id })
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        const formattedTransactions = transactions.map(transaction => ({
            id: transaction._id,
            desc: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }));

        res.json(formattedTransactions);

    } catch (err) {
        console.error('Get recent transactions error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent transactions'
        });
    }
};


module.exports.getCategorySpending = async (req, res) => {
    try {
        const email = req.user.email;
        const userData = await UserData.findOne({ email });
        
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User data not found'
            });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const categorySpending = await Expense.aggregate([
            {
                $match: {
                    userId: req.user.id,
                    type: 'expense',
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: '$category',
                    spent: { $sum: '$amount' }
                }
            }
        ]);

        const spentMap = {};
        categorySpending.forEach(item => {
            spentMap[item._id] = item.spent;
        });


        const totalBudget = (parseFloat(userData.monthlyIncome) || 0) * 0.8;
        const budgetPerCategory = userData.expenseCategories.length > 0 ? 
            totalBudget / userData.expenseCategories.length : 0;

        const colors = [
            'bg-gradient-to-r from-purple-500 to-pink-500',
            'bg-gradient-to-r from-blue-500 to-cyan-500',
            'bg-gradient-to-r from-green-500 to-emerald-500',
            'bg-gradient-to-r from-yellow-500 to-orange-500',
            'bg-gradient-to-r from-red-500 to-pink-500',
            'bg-gradient-to-r from-indigo-500 to-purple-500'
        ];

        const result = userData.expenseCategories.map((category, index) => ({
            category: category.charAt(0).toUpperCase() + category.slice(1),
            spent: Math.round((spentMap[category.toLowerCase()] || 0) * 100) / 100,
            budget: Math.round(budgetPerCategory * 100) / 100,
            color: colors[index % colors.length]
        }));

        res.json(result);

    } catch (err) {
        console.error('Get category spending error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category spending'
        });
    }
};

module.exports.getAIInsights = async (req, res) => {
    try {
        const email = req.user.email;
        const userData = await UserData.findOne({ email });
        
        if (!userData) {
            return res.status(404).json({
                success: false,
                error: 'User data not found'
            });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: req.user.id,
                    type: 'expense',
                    date: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$amount' },
                    transactionCount: { $sum: 1 }
                }
            }
        ]);

        const insights = [];
        const monthlyIncome = parseFloat(userData.monthlyIncome) || 0;
        const budget = monthlyIncome * 0.8;
        const totalSpent = monthlyExpenses.length > 0 ? monthlyExpenses[0].totalSpent : 0;
        const transactionCount = monthlyExpenses.length > 0 ? monthlyExpenses[0].transactionCount : 0;

        if (totalSpent > budget) {
            insights.push({
                type: 'warning',
                message: `You've exceeded your budget by $${Math.round((totalSpent - budget) * 100) / 100} this month.`,
                action: 'Review spending'
            });
        } else if (totalSpent < budget * 0.5) {
            insights.push({
                type: 'success',
                message: `Great job! You're well within budget this month.`,
                action: 'Keep it up'
            });
        }

        if (transactionCount < 5) {
            insights.push({
                type: 'tip',
                message: 'Track more expenses to get better insights and recommendations.',
                action: 'Add expenses'
            });
        }

        const savings = monthlyIncome - totalSpent;
        if (savings > monthlyIncome * 0.2) {
            insights.push({
                type: 'success',
                message: `Excellent! You've saved $${Math.round(savings * 100) / 100} this month.`,
                action: 'Consider investing'
            });
        }

        if (userData.primaryGoal === 'save' && savings > 0) {
            insights.push({
                type: 'tip',
                message: 'Consider setting up automatic transfers to boost your savings goal.',
                action: 'Set up auto-save'
            });
        }

        res.json(insights);

    } catch (err) {
        console.error('Get AI insights error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to generate insights'
        });
    }
};


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

module.exports.getName = async(req,res) =>{
    const email = req.user.email;
    const query = "Select username from users where email = ?"
    
    db.query(query,[email],(err,result)=>{
        if(err){
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if(result.length == 0){
            console.log("user not found");
            return res.status(404).json({ error: "User not found" });
        }
        const {username} = result[0];
        res.status(200).json({username})
    })
};