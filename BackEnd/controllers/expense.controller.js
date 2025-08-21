const { validationResult } = require('express-validator');
const Expense = require('../models/ExpenseSchema');
const UserData = require('../models/schema');

const expenseController = {

  addExpense: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { amount, category, description, date, type = 'expense' } = req.body;
      const userId = req.user.id;


      const expense = new Expense({
        userId,
        amount: parseFloat(amount),
        category: category.toLowerCase().trim(),
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
        type
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
          date: expense.date,
          type: expense.type
        }
      });

    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add expense'
      });
    }
  },


  getExpenses: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        category, 
        type, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 20,
        sortBy = 'date',
        sortOrder = 'desc'  
      } = req.query;


      const filter = { userId };
      
      if (category) {
        filter.category = category.toLowerCase();
      }
      
      if (type) {
        filter.type = type;
      }
      
      if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;


      const [expenses, totalCount] = await Promise.all([
        Expense.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Expense.countDocuments(filter)
      ]);

      res.json({
        success: true,
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + expenses.length < totalCount,
          hasPrev: parseInt(page) > 1
        }
      });

    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expenses'
      });
    }
  },

  updateExpense: async (req, res) => {
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
      const userId = req.user.id;
      const updateData = { ...req.body };


      if (updateData.amount) {
        updateData.amount = parseFloat(updateData.amount);
      }
      if (updateData.category) {
        updateData.category = updateData.category.toLowerCase().trim();
      }
      if (updateData.description) {
        updateData.description = updateData.description.trim();
      }
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      const expense = await Expense.findOneAndUpdate(
        { _id: id, userId },
        updateData,
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
  },


  deleteExpense: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const expense = await Expense.findOneAndDelete({ _id: id, userId });

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete expense'
      });
    }
  }
};

module.exports = expenseController;