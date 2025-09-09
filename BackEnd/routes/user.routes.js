const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const expenseController = require('../controllers/expense.controller');
// const goalController = require('../controllers/goal.controller');
const aiExpenseController = require('../controllers/aiExpenseController');


router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.registerUser);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], userController.loginUser);

router.post('/onboarding-2', authMiddleware.authUser, userController.onBoarding);


router.get('/profile', authMiddleware.authUser, userController.getProfile);
router.get('/logout', authMiddleware.authUser, userController.logOut);
router.get('/details', authMiddleware.authUser, userController.getUserDetails);
router.get('/monthly-summary', authMiddleware.authUser, userController.getMonthlySummary);
router.get('/transactions/recent', authMiddleware.authUser, userController.getRecentTransactions);
router.get('/category-spending', authMiddleware.authUser, userController.getCategorySpending);
router.get('/ai-insights', authMiddleware.authUser, userController.getAIInsights);
router.get('/name', authMiddleware.authUser, userController.getName);

// Regular expense routes
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

// Goal routes
router.post('/goals', [
  body('title').notEmpty().withMessage('Goal title is required'),
  body('targetAmount').isNumeric().withMessage('Target amount must be a number'),
  body('targetAmount').isFloat({ min: 1 }).withMessage('Target amount must be greater than 0'),
  body('currentAmount').optional().isNumeric().withMessage('Current amount must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('targetDate').isISO8601().withMessage('Valid target date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high')
], authMiddleware.authUser, userController.createGoal);

router.get('/goals', authMiddleware.authUser, userController.getGoals);
router.get('/goals/:id', authMiddleware.authUser, userController.getGoalById);
router.put('/goals/:id', [
  body('title').optional().notEmpty().withMessage('Goal title cannot be empty'),
  body('targetAmount').optional().isNumeric().withMessage('Target amount must be a number'),
  body('currentAmount').optional().isNumeric().withMessage('Current amount must be a number'),
  body('targetDate').optional().isISO8601().withMessage('Valid target date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high')
], authMiddleware.authUser, userController.updateGoal);

router.delete('/goals/:id', authMiddleware.authUser, userController.deleteGoal);
router.patch('/goals/:id/progress', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be greater than or equal to 0')
], authMiddleware.authUser, userController.updateGoalProgress);

// AI expense processing routes
router.post('/expenses/process-text', [
  body('text').notEmpty().withMessage('Expense text is required'),
  body('text').isLength({ min: 5, max: 500 }).withMessage('Text must be between 5 and 500 characters')
], authMiddleware.authUser, aiExpenseController.processExpenseText);

router.post('/expenses/save-processed', [
  body('analysisData').notEmpty().withMessage('Analysis data is required'),
  body('analysisData.amount').isNumeric().withMessage('Amount must be a number'),
  body('analysisData.category').notEmpty().withMessage('Category is required')
], authMiddleware.authUser, aiExpenseController.saveProcessedExpense);

router.get('/expenses/ai-insights', authMiddleware.authUser, aiExpenseController.getAIInsights);
router.get('/expenses/ai-processed', authMiddleware.authUser, aiExpenseController.getAIExpenses);
router.get('/expenses/export-rag', authMiddleware.authUser, aiExpenseController.exportExpensesForRAG);

// NEW: Add the RAG monthly processing route
router.post('/expenses/process-monthly-paragraph', [
  body('paragraph').notEmpty().withMessage('Monthly expense paragraph is required'),
  body('paragraph').isLength({ min: 10, max: 2000 }).withMessage('Paragraph must be between 10 and 2000 characters')
], authMiddleware.authUser, aiExpenseController.processMonthlyExpenseParagraph);

// NEW: Add the RAG export training data route
router.get('/expenses/export-rag-training', authMiddleware.authUser, aiExpenseController.exportRAGTrainingData);

module.exports = router;