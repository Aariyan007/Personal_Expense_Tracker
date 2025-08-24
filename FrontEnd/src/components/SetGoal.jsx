import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, DollarSign, Calendar, TrendingUp, PiggyBank, Home, Car, GraduationCap, Plane, Heart, Star, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

function SetGoal({ onClose, onGoalSet }) {
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState({ currency: 'USD' });

  const goalCategories = [
    { id: 'emergency', name: 'Emergency Fund', icon: '🛡️', color: 'from-red-500 to-orange-500' },
    { id: 'vacation', name: 'Vacation', icon: '🌴', color: 'from-blue-500 to-cyan-500' },
    { id: 'house', name: 'House/Property', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    { id: 'car', name: 'Car/Vehicle', icon: '🚗', color: 'from-purple-500 to-pink-500' },
    { id: 'education', name: 'Education', icon: '🎓', color: 'from-indigo-500 to-purple-500' },
    { id: 'wedding', name: 'Wedding', icon: '💍', color: 'from-pink-500 to-rose-500' },
    { id: 'retirement', name: 'Retirement', icon: '🌅', color: 'from-yellow-500 to-orange-500' },
    { id: 'business', name: 'Business', icon: '💼', color: 'from-gray-600 to-gray-800' },
    { id: 'other', name: 'Other', icon: '🎯', color: 'from-slate-500 to-slate-700' }
  ];

  const priorities = [
    { id: 'low', name: 'Low Priority', color: 'text-green-400', bg: 'bg-green-500/20' },
    { id: 'medium', name: 'Medium Priority', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'high', name: 'High Priority', color: 'text-red-400', bg: 'bg-red-500/20' }
  ];

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
      
      setUserData(response.data);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$' };
    return symbols[currency] || '$';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        targetDate: new Date(formData.targetDate).toISOString(),
        createdAt: new Date().toISOString()
      };

      const response = await axios.post(`${baseUrl}/user/goals`, goalData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          onGoalSet?.(response.data);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = () => {
    const current = parseFloat(formData.currentAmount) || 0;
    const target = parseFloat(formData.targetAmount) || 1;
    return Math.min((current / target) * 100, 100);
  };

  const getTimeRemaining = () => {
    if (!formData.targetDate) return '';
    const target = new Date(formData.targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Target date passed';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    if (diffDays < 30) return `${diffDays} days left`;
    
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month left' : `${months} months left`;
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const stepVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center max-w-md w-full"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Goal Created Successfully! 🎉</h3>
          <p className="opacity-90">Your financial goal has been set. Stay consistent and track your progress!</p>
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
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Set Financial Goal</h2>
              <p className="text-blue-200">Step {step} of 3</p>
            </div>
          </motion.div>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Goal Category & Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-4">What's your goal?</h3>
                <input
                  type="text"
                  placeholder="e.g., Emergency Fund, Dream Vacation, New Car"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Choose a category</h4>
                <div className="grid grid-cols-3 gap-3">
                  {goalCategories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInputChange('category', category.id)}
                      className={`p-4 rounded-xl border transition-all ${
                        formData.category === category.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <p className="text-xs text-white font-medium">{category.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Tell us more about your goal..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500 resize-none"
                  rows="3"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Financial Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Financial Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Target Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                    <input
                      type="number"
                      placeholder="10000"
                      value={formData.targetAmount}
                      onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-4 pl-12 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Current Amount</label>
                  <div className="relative">
                    <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.currentAmount}
                      onChange={(e) => handleInputChange('currentAmount', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-4 pl-12 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange('targetDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-4 pl-12 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Progress Preview */}
              {formData.targetAmount && (
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <h4 className="text-white font-semibold mb-4">Progress Preview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-200">Current: {getCurrencySymbol(userData.currency)}{formData.currentAmount || 0}</span>
                      <span className="text-white">Target: {getCurrencySymbol(userData.currency)}{formData.targetAmount}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress()}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">{getProgress().toFixed(1)}% Complete</span>
                      {formData.targetDate && (
                        <span className="text-yellow-400">{getTimeRemaining()}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Priority & Confirmation */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Set Priority & Review</h3>

              <div>
                <label className="block text-white font-medium mb-4">Priority Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {priorities.map((priority) => (
                    <motion.button
                      key={priority.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleInputChange('priority', priority.id)}
                      className={`p-4 rounded-xl border transition-all ${
                        formData.priority === priority.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${priority.bg} mx-auto mb-2`} />
                      <p className={`text-xs font-medium ${priority.color}`}>{priority.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Goal Summary */}
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Goal Summary
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Goal:</span>
                    <span className="text-white font-medium">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Category:</span>
                    <span className="text-white">
                      {goalCategories.find(c => c.id === formData.category)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Target Amount:</span>
                    <span className="text-green-400 font-semibold">
                      {getCurrencySymbol(userData.currency)}{formData.targetAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Target Date:</span>
                    <span className="text-white">
                      {formData.targetDate ? new Date(formData.targetDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Priority:</span>
                    <span className={priorities.find(p => p.id === formData.priority)?.color}>
                      {priorities.find(p => p.id === formData.priority)?.name}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex gap-4 mt-8">
          {step > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 text-white font-medium hover:bg-white/20 transition-all"
            >
              Previous
            </motion.button>
          )}
          
          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!formData.title || !formData.category)) ||
                (step === 2 && (!formData.targetAmount || !formData.targetDate))
              }
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl py-4 text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading || !formData.title || !formData.category || !formData.targetAmount}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl py-4 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Goal
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SetGoal;