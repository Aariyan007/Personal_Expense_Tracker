import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, TrendingUp, Calendar, Eye, Plus, 
  CheckCircle, Clock, AlertTriangle, ArrowRight 
} from 'lucide-react';

function GoalsOverviewSection({ userData, onViewAllGoals, onCreateGoal }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0
  });

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

  useEffect(() => {
    fetchGoalsOverview();
  }, []);

  const fetchGoalsOverview = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;

      // Note: This expects axios to be available in your project
      const response = await fetch(`${baseUrl}/user/goals?status=all&limit=5&sortBy=targetDate&sortOrder=asc`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        const allGoals = data.goals || [];
        setGoals(allGoals.slice(0, 3)); // Show only top 3 in overview

        // Calculate stats
        const activeGoals = allGoals.filter(g => g.status === 'active');
        const completedGoals = allGoals.filter(g => g.status === 'completed');
        const totalTargetAmount = allGoals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalCurrentAmount = allGoals.reduce((sum, g) => sum + g.currentAmount, 0);

        setStats({
          total: allGoals.length,
          active: activeGoals.length,
          completed: completedGoals.length,
          totalTargetAmount,
          totalCurrentAmount
        });
      }
    } catch (err) {
      console.error('Error fetching goals overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$' };
    return symbols[currency] || '$';
  };

  const getTimeRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400', icon: AlertTriangle };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-400', icon: Clock };
    if (diffDays < 7) return { text: `${diffDays} days`, color: 'text-yellow-400', icon: Clock };
    if (diffDays < 30) return { text: `${diffDays} days`, color: 'text-green-400', icon: Calendar };
    
    const months = Math.floor(diffDays / 30);
    return { 
      text: months === 1 ? '1 month' : `${months} months`, 
      color: 'text-blue-400',
      icon: Calendar
    };
  };

  const overallProgress = stats.totalTargetAmount > 0 ? 
    (stats.totalCurrentAmount / stats.totalTargetAmount) * 100 : 0;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardHover = {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  };

  if (isLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🎯 Financial Goals
          <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
            {stats.active} Active
          </span>
        </h3>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateGoal}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg px-3 py-2 text-white text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewAllGoals}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-medium hover:bg-white/20 transition-all flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View All
          </motion.button>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
          <h4 className="text-lg font-semibold text-white mb-2">No Goals Yet</h4>
          <p className="text-blue-200 mb-4">Start tracking your financial goals to stay motivated and organized!</p>
          <motion.button
            whileHover={cardHover}
            onClick={onCreateGoal}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl px-6 py-3 text-white font-medium hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            Create Your First Goal
          </motion.button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Goals Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={cardHover}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-blue-200 text-sm">Total Goals</p>
            </motion.div>

            <motion.div
              whileHover={cardHover}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.active}</span>
              </div>
              <p className="text-blue-200 text-sm">Active</p>
            </motion.div>

            <motion.div
              whileHover={cardHover}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.completed}</span>
              </div>
              <p className="text-blue-200 text-sm">Completed</p>
            </motion.div>

            <motion.div
              whileHover={cardHover}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">💰</span>
                <span className="text-xl font-bold text-green-400">
                  {overallProgress.toFixed(0)}%
                </span>
              </div>
              <p className="text-blue-200 text-sm">Overall Progress</p>
            </motion.div>
          </div>

          {/* Overall Progress Bar */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-white font-semibold">Overall Goal Progress</h4>
              <span className="text-green-400 font-bold">{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-2">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-200">
                Saved: {getCurrencySymbol(userData.currency)}{stats.totalCurrentAmount.toLocaleString()}
              </span>
              <span className="text-white">
                Target: {getCurrencySymbol(userData.currency)}{stats.totalTargetAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recent Goals */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h4 className="text-white font-semibold mb-4">Recent Goals</h4>
            <div className="space-y-4">
              {goals.length > 0 ? goals.map((goal, index) => {
                const category = goalCategories[goal.category] || goalCategories.other;
                const timeRemaining = getTimeRemaining(goal.targetDate);
                const TimeIcon = timeRemaining.icon;

                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-sm`}>
                        {category.icon}
                      </div>
                      <div>
                        <h5 className="font-medium text-white">{goal.title}</h5>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-200">
                            {getCurrencySymbol(userData.currency)}{goal.currentAmount.toLocaleString()} / 
                            {getCurrencySymbol(userData.currency)}{goal.targetAmount.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <TimeIcon className={`w-3 h-3 ${timeRemaining.color}`} />
                            <span className={timeRemaining.color}>{timeRemaining.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-green-400 font-semibold text-sm">
                          {goal.progressPercentage.toFixed(1)}%
                        </p>
                        <div className="w-16 bg-white/10 rounded-full h-1.5 mt-1">
                          <div
                            className={`bg-gradient-to-r ${category.color} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400 opacity-60" />
                    </div>
                  </motion.div>
                );
              }) : (
                <p className="text-blue-200 text-center py-4">No active goals to display</p>
              )}
            </div>

            {goals.length > 0 && stats.total > 3 && (
              <motion.button
                whileHover={cardHover}
                onClick={onViewAllGoals}
                className="w-full mt-4 bg-white/5 border border-white/20 rounded-lg py-3 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                View All {stats.total} Goals
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default GoalsOverviewSection;