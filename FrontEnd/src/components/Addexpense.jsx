import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Tag, FileText, Calendar, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AddExpense = ({ onClose, onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  const [userCategories, setUserCategories] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;
      
      const response = await axios.get(`${baseUrl}/user/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserCategories(response.data.expenseCategories || []);
      setCurrency(response.data.currency || 'USD');
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const getCurrencySymbol = (curr) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$' };
    return symbols[curr] || '$';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Please select or enter a category');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;
      
      const response = await axios.post(`${baseUrl}/user/expenses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShowSuccess(true);
        
        // Call callback to refresh home page data
        if (onExpenseAdded) {
          onExpenseAdded();
        }
        
        // Auto close after success
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err.response?.data?.error || 'Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Groceries',
    'Other'
  ];

  const allCategories = [...new Set([...userCategories, ...categoryOptions])];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25
      }
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          variants={successVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-8 text-white text-center max-w-md mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">Success!</h3>
          <p>Your expense has been added successfully</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-6 w-full max-w-md border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-bold text-white">Add Expense</h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-12 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                {getCurrencySymbol(currency)}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-400 focus:outline-none transition-colors appearance-none"
              >
                <option value="" className="bg-slate-800">Select a category</option>
                {allCategories.map((cat, index) => (
                  <option key={index} value={cat.toLowerCase()} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-white/60" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What did you spend on?"
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-400 focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Type
            </label>
            <div className="flex gap-3">
              <label className="flex-1">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-400 bg-red-500/20 text-red-400'
                    : 'border-white/20 bg-white/10 text-white/60 hover:border-white/40'
                }`}>
                  <div className="text-sm font-medium">💸 Expense</div>
                </div>
              </label>
              
              <label className="flex-1">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                  formData.type === 'income'
                    ? 'border-green-400 bg-green-500/20 text-green-400'
                    : 'border-white/20 bg-white/10 text-white/60 hover:border-white/40'
                }`}>
                  <div className="text-sm font-medium">💰 Income</div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                Add {formData.type === 'expense' ? 'Expense' : 'Income'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddExpense;