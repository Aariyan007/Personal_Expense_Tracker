const Expense = require('../models/ExpenseSchema');
const { validationResult } = require('express-validator');

class ExpenseController {
  
  // Traditional CRUD operations for expenses
  async addExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { amount, category, description, type = 'expense' } = req.body;
      const userId = req.user.id;

      const expense = new Expense({
        userId,
        amount,
        category,
        description,
        type,
        date: new Date()
      });

      await expense.save();

      res.status(201).json({
        success: true,
        message: 'Expense added successfully',
        expense: {
          id: expense._id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          type: expense.type,
          date: expense.date
        }
      });

    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add expense'
      });
    }
  }

  async getExpenses(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, category, type } = req.query;

      let query = { userId };
      
      if (category) {
        query.category = category;
      }
      
      if (type) {
        query.type = type;
      }

      const expenses = await Expense.find(query)
        .sort({ date: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Expense.countDocuments(query);

      res.json({
        success: true,
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error getting expenses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get expenses'
      });
    }
  }

  async updateExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { amount, category, description } = req.body;
      const userId = req.user.id;

      const expense = await Expense.findOneAndUpdate(
        { _id: id, userId },
        { amount, category, description },
        { new: true, runValidators: true }
      );

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense updated successfully',
        expense
      });

    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update expense'
      });
    }
  }

  async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const expense = await Expense.findOneAndDelete({ _id: id, userId });

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully',
        expense: {
          id: expense._id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description
        }
      });

    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete expense'
      });
    }
  }
}

module.exports = new ExpenseController();