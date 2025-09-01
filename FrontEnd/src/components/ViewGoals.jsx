import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, DollarSign, Calendar, TrendingUp, Plus, Edit3, Trash2, 
  CheckCircle, Clock, AlertCircle, Filter, Search, MoreVertical,
  PiggyBank, Home, Car, GraduationCap, Plane, Heart, Star,
  ArrowUp, ArrowDown, Eye, Play, Pause, RotateCcw
} from 'lucide-react';
import axios from 'axios';


function ViewGoals({ onClose, onEditGoal, onCreateGoal }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({ currency: 'USD' });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [filters, setFilters] = useState({
    status: 'active',
    category: '',
    priority: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('targetDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const goalCategories = {
    emergency: { name: 'Emergency Fund', icon: '🛡️', color: 'from-red-500 to-orange-500' },
    vacation: { name: 'Vacation', icon: '🌴', color: 'from-blue-500 to-cyan-500' },
    house: { name: 'House/Property', icon: '🏠', color: 'from-green-500 to-emerald-500' },
    car: { name: 'Car/Vehicle', icon: '🚗', color: 'from-purple-500 to-pink-500' },
    education: { name: 'Education', icon: '🎓', color: 'from-indigo-500 to-purple-500' },
    wedding: { name: 'Wedding', icon: '💍', color: 'from-pink-500 to-rose-500' },
    retirement: { name: 'Retirement', icon: '🌅', color: 'from-yellow-500 to-orange-500' },
    business: { name: 'Business', icon: '💼', color: 'from-gray-600 to-gray-800' },
    other: { name: 'Other', icon: '🎯', color: 'from-slate-500 to-slate-700' }
  };

  const statusConfig = {
    active: { color: 'text-green-400', bg: 'bg-green-500/20', icon: Play },
    completed: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: CheckCircle },
    paused: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Pause },
    cancelled: { color: 'text-red-400', bg: 'bg-red-500/20', icon: X }
  };

  const priorityConfig = {
    low: { color: 'text-green-400', bg: 'bg-green-500/20' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    high: { color: 'text-red-400', bg: 'bg-red-500/20' }
  };

  useEffect(() => {
    fetchGoals();
    fetchUserData();
  }, [filters, sortBy, sortOrder]);

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

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const params = new URLSearchParams({
        status: filters.status,
        sortBy,
        sortOrder,
        limit: '20'
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(`${baseUrl}/user/goals?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let goalsData = response.data.goals || [];


      if (filters.search) {
        goalsData = goalsData.filter(goal => 
          goal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          goal.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setGoals(goalsData);
    } catch (err) {
      setError('Failed to fetch goals. Please try again.');
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$' };
    return symbols[currency] || '$';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-400' };
    if (diffDays === 1) return { text: '1 day left', color: 'text-yellow-400' };
    if (diffDays < 7) return { text: `${diffDays} days`, color: 'text-yellow-400' };
    if (diffDays < 30) return { text: `${diffDays} days`, color: 'text-green-400' };
    
    const months = Math.floor(diffDays / 30);
    return { 
      text: months === 1 ? '1 month' : `${months} months`, 
      color: 'text-blue-400' 
    };
  };

  const updateGoalProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;

      await axios.patch(`${baseUrl}/user/goals/${selectedGoal._id}/progress`, {
        amount: parseFloat(progressAmount),
        note: progressNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowProgressModal(false);
      setProgressAmount('');
      setProgressNote('');
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;

      await axios.delete(`${baseUrl}/user/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
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
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hover: {
      scale: 1.02,
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/20"
      >
                                                
        <div className="flex items-center justify-between mb-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Goals</h2>
              <p className="text-blue-200">Track and manage your financial goals</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateGoal}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl px-4 py-2 text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Goal
            </motion.button>
            
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
        </div>


        <motion.div variants={itemVariants} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
              <input
                type="text"
                placeholder="Search goals..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="active" className="bg-slate-800">Active</option>
              <option value="completed" className="bg-slate-800">Completed</option>
              <option value="paused" className="bg-slate-800">Paused</option>
              <option value="all" className="bg-slate-800">All Goals</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="" className="bg-slate-800">All Categories</option>
              {Object.entries(goalCategories).map(([key, category]) => (
                <option key={key} value={key} className="bg-slate-800">{category.name}</option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="targetDate-asc" className="bg-slate-800">Due Date (Soon)</option>
              <option value="targetDate-desc" className="bg-slate-800">Due Date (Later)</option>
              <option value="targetAmount-desc" className="bg-slate-800">Amount (High)</option>
              <option value="targetAmount-asc" className="bg-slate-800">Amount (Low)</option>
              <option value="progressPercentage-desc" className="bg-slate-800">Progress (High)</option>
            </select>
          </div>
        </motion.div>


        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center text-blue-200 py-12">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No goals found</h3>
              <p className="mb-4">Start by creating your first financial goal!</p>
              <button
                onClick={onCreateGoal}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl px-6 py-3 text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal, index) => {
                const category = goalCategories[goal.category] || goalCategories.other;
                const timeRemaining = getTimeRemaining(goal.targetDate);
                const StatusIcon = statusConfig[goal.status]?.icon || Play;
                
                return (
                  <motion.div
                    key={goal._id}
                    variants={itemVariants}
                    whileHover="hover"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{goal.title}</h3>
                          <p className="text-blue-200 text-sm">{category.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-lg ${statusConfig[goal.status]?.bg || 'bg-gray-500/20'}`}>
                          <StatusIcon className={`w-4 h-4 ${statusConfig[goal.status]?.color || 'text-gray-400'}`} />
                        </div>
                        
                        <div className="relative group">
                          <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                            <MoreVertical className="w-4 h-4 text-white" />
                          </button>
                          <div className="absolute right-0 top-10 bg-slate-800 rounded-lg shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() => {
                                setSelectedGoal(goal);
                                setShowProgressModal(true);
                              }}
                              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Update Progress
                            </button>
                            <button
                              onClick={() => onEditGoal?.(goal)}
                              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteGoal(goal._id)}
                              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-blue-200">
                          {getCurrencySymbol(userData.currency)}{goal.currentAmount.toLocaleString()}
                        </span>
                        <span className="text-white">
                          {getCurrencySymbol(userData.currency)}{goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <motion.div
                          className={`bg-gradient-to-r ${category.color} h-3 rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-green-400 font-medium">
                          {goal.progressPercentage.toFixed(1)}% Complete
                        </span>
                        <span className={timeRemaining.color}>
                          {timeRemaining.text}
                        </span>
                      </div>
                    </div>


                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Target Date:</span>
                        <span className="text-white">{formatDate(goal.targetDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Remaining:</span>
                        <span className="text-yellow-400 font-medium">
                          {getCurrencySymbol(userData.currency)}{goal.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Priority:</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${priorityConfig[goal.priority]?.bg} ${priorityConfig[goal.priority]?.color}`}>
                          {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                        </span>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-blue-200 text-sm mt-3 line-clamp-2">{goal.description}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>


      <AnimatePresence>
        {showProgressModal && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Update Progress</h3>
              <p className="text-blue-200 mb-6">{selectedGoal.title}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">New Total Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                    <input
                      type="number"
                      value={progressAmount}
                      onChange={(e) => setProgressAmount(e.target.value)}
                      placeholder={selectedGoal.currentAmount.toString()}
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Note (Optional)</label>
                  <textarea
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    placeholder="Add a note about this progress update..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-blue-200 focus:outline-none focus:border-purple-500 resize-none"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressAmount('');
                    setProgressNote('');
                    setSelectedGoal(null);
                  }}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl py-3 text-white font-medium hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={updateGoalProgress}
                  disabled={!progressAmount}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl py-3 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50"
                >
                  Update Progress
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewGoals;