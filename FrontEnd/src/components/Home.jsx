import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, TrendingUp, TrendingDown, Target, DollarSign, Calendar, BarChart3, PieChart, Bell, Settings, User, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

function ExpenseTrackerHome() {
  const [userData, setUserData] = useState({
    name: '',
    monthlyIncome: 0,
    currency: 'USD',
    primaryGoal: '',
    budgetPreference: '',
    expenseCategories: []
  });

  const [currentMonth, setCurrentMonth] = useState({
    spent: 0,
    budget: 0,
    savings: 0,
    income: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_BASE_URL;

        // Fetch user details from onboarding
        const userResponse = await axios.get(`${baseUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userResponse.data);

        // Fetch current month summary (assume an endpoint that computes this based on user data)
        const monthResponse = await axios.get(`${baseUrl}/user/monthly-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentMonth(monthResponse.data);

        // Fetch recent transactions
        const transResponse = await axios.get(`${baseUrl}/user/transactions/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentTransactions(transResponse.data);

        // Fetch category spending (assume computed from transactions and user categories)
        const categoryResponse = await axios.get(`${baseUrl}/user/category-spending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategorySpending(categoryResponse.data);

        // Fetch AI insights (assume generated server-side based on user data)
        const insightsResponse = await axios.get(`${baseUrl}/user/ai-insights`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAiInsights(insightsResponse.data);

      } catch (err) {
        console.error('Error fetching ', err);
        setError('Failed to load your data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'C$' };
    return symbols[currency] || '$';
  };

  const getGoalIcon = (goal) => {
    const icons = {
      save: '💰',
      budget: '📊', 
      invest: '📈',
      debt: '💳'
    };
    return icons[goal] || '💰';
  };

  const getSpendingPercentage = () => ((currentMonth.spent / currentMonth.budget) * 100).toFixed(1);
  
  const getBudgetStatus = () => {
    const percentage = getSpendingPercentage();
    if (percentage < 70) return { color: 'text-green-400', status: 'Great' };
    if (percentage < 90) return { color: 'text-yellow-400', status: 'Good' };
    return { color: 'text-red-400', status: 'Caution' };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const cardHover = {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

      <motion.main 
        className="max-w-7xl mx-auto px-6 py-8 pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {userData.name}! {getGoalIcon(userData.primaryGoal)}
          </h2>
          <p className="text-blue-200 text-lg">
            Here's your financial overview for July 2025
          </p>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl">{getCurrencySymbol(userData.currency)}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{currentMonth.income.toLocaleString()}</h3>
            <p className="text-blue-200 text-sm">Monthly Income</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <span className={`text-sm ${getBudgetStatus().color}`}>{getBudgetStatus().status}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{getCurrencySymbol(userData.currency)}{currentMonth.spent.toLocaleString()}</h3>
            <p className="text-blue-200 text-sm">{getSpendingPercentage()}% of budget used</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{getCurrencySymbol(userData.currency)}{currentMonth.savings.toLocaleString()}</h3>
            <p className="text-blue-200 text-sm">Saved this month</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={cardHover}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-green-400">+{(((currentMonth.budget - currentMonth.spent) / currentMonth.budget) * 100).toFixed(1)}%</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{getCurrencySymbol(userData.currency)}{(currentMonth.budget - currentMonth.spent).toLocaleString()}</h3>
            <p className="text-blue-200 text-sm">Remaining budget</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Insights */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🤖 AI Insights
                <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Smart</span>
              </h3>
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    whileHover={cardHover}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                      {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {insight.type === 'tip' && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">💡</div>}
                      <p className="text-sm">{insight.message}</p>
                    </div>
                    <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                      {insight.action}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Category Spending */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Category Spending</h3>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  {categorySpending.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm">
                          {getCurrencySymbol(userData.currency)}{category.spent} / {getCurrencySymbol(userData.currency)}{category.budget}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${category.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.spent / category.budget) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={cardHover}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 flex items-center gap-3 hover:from-purple-600 hover:to-indigo-700 transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="font-medium">Add Expense</span>
                </motion.button>
                
                <motion.button
                  whileHover={cardHover}
                  className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">View Analytics</span>
                </motion.button>
                
                <motion.button
                  whileHover={cardHover}
                  className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Set Goal</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {transaction.type === 'income' ? 
                            <ArrowUpRight className="w-4 h-4 text-green-400" /> : 
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.desc}</p>
                          <p className="text-xs text-blue-200">{transaction.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}{getCurrencySymbol(userData.currency)}{Math.abs(transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-purple-400 text-sm hover:text-purple-300 transition-colors">
                  View all transactions
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

export default ExpenseTrackerHome;
