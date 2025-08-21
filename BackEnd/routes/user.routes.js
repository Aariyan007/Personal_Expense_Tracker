const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const expenseController = require('../controllers/expense.controller');

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
router.get('/name', authMiddleware.authUser, userController.getName);

router.post('/expenses', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').optional().isIn(['expense', 'income']).withMessage('Type must be expense or income')
], authMiddleware.authUser, expenseController.addExpense);

router.get('/expenses', authMiddleware.authUser, expenseController.getExpenses);
router.put('/expenses/:id', [
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], authMiddleware.authUser, expenseController.updateExpense);

router.delete('/expenses/:id', authMiddleware.authUser, expenseController.deleteExpense);


module.exports = router;