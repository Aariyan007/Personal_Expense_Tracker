const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Authentication routes
router.post('/register',[
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long')
], userController.registerUser);

router.post('/login',[
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
], userController.loginUser);

// Onboarding route
router.post('/onboarding-2', authMiddleware.authUser, userController.onBoarding);

// Profile routes
router.get('/profile', authMiddleware.authUser, userController.getProfile);
router.get('/logout', authMiddleware.authUser, userController.logOut);

// NEW ROUTES FOR HOME PAGE DATA:
// NEW ROUTES FOR HOME PAGE DATA:
router.get('/details', authMiddleware.authUser, userController.getUserDetails);
router.get('/monthly-summary', authMiddleware.authUser, userController.getMonthlySummary);
router.get('/transactions/recent', authMiddleware.authUser, userController.getRecentTransactions);
router.get('/category-spending', authMiddleware.authUser, userController.getCategorySpending);
router.get('/ai-insights', authMiddleware.authUser, userController.getAIInsights);

module.exports = router;