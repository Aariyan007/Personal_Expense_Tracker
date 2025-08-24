import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, TrendingUp, TrendingDown, Target, DollarSign, Calendar, BarChart3, PieChart, Bell, Settings, User, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import AddExpense from './Addexpense';
import ViewAnalytics from './ViewAnalytics';
import { useNavigate } from 'react-router-dom';
import SetGoal from './SetGoal';
import GoalsOverviewSection from './GoalsOverviewSection';
import ViewGoals from './ViewGoals';

function ExpenseTrackerHome() {
  const navigate = useNavigate();
  const [showSetGoal, setShowSetGoal] = useState(false);
  const [showViewGoals, setShowViewGoals] = useState(false);
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
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;

      console.log('Debug Info:');
      console.log('Token:', token ? 'Token exists' : 'No token found');
      console.log('Base URL:', baseUrl);

      if (!token) {
        setError('No authentication token found. Please login again.');
        setIsLoading(false);
        return;
      }

      if (!baseUrl) {
        setError('Base URL not configured. Check your .env file.');
        setIsLoading(false);
        return;
      }

      const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Making API calls...');


      try {
        console.log('Testing /user/details...');
        const userResponse = await axios.get(`${baseUrl}/user/details`, axiosConfig);
        console.log('User details response:', userResponse.data);
        setUserData(userResponse.data);
      } catch (err) {
        console.error('User details error:', err.response?.data || err.message);
        throw new Error(`User details failed: ${err.response?.data?.error || err.message}`);
      }

      try {
        console.log('Testing /user/monthly-summary...');
        const monthResponse = await axios.get(`${baseUrl}/user/monthly-summary`, axiosConfig);
        console.log('Monthly summary response:', monthResponse.data);
        setCurrentMonth(monthResponse.data);
      } catch (err) {
        console.error('Monthly summary error:', err.response?.data || err.message);

        setCurrentMonth({
          spent: 0,
          budget: 0,
          savings: 0,
          income: 0
        });
      }

      try {
        console.log('Testing /user/transactions/recent...');
        const transResponse = await axios.get(`${baseUrl}/user/transactions/recent`, axiosConfig);
        console.log('Transactions response:', transResponse.data);
        setRecentTransactions(transResponse.data);
      } catch (err) {
        console.error('Transactions error:', err.response?.data || err.message);
        setRecentTransactions([]);
      }

      try {
        console.log('Testing /user/category-spending...');
        const categoryResponse = await axios.get(`${baseUrl}/user/category-spending`, axiosConfig);
        console.log('Category spending response:', categoryResponse.data);
        setCategorySpending(categoryResponse.data);
      } catch (err) {
        console.error('Category spending error:', err.response?.data || err.message);
        setCategorySpending([]);
      }

      try {
        console.log('Testing /user/ai-insights...');
        const insightsResponse = await axios.get(`${baseUrl}/user/ai-insights`, axiosConfig);
        console.log('AI insights response:', insightsResponse.data);
        setAiInsights(insightsResponse.data);
      } catch (err) {
        console.error('AI insights error:', err.response?.data || err.message);
        setAiInsights([]);
      }

    } catch (err) {
      console.error('🚨 Fatal error in fetchUserData:', err);


      if (err.code === 'NETWORK_ERROR') {
        setError('Network error: Cannot connect to server. Is your backend running?');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else if (err.response?.status === 404) {
        setError('API endpoint not found. Please check your backend routes.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.message || 'Failed to load your data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = () => {
    setShowSetGoal(true);
  };
  const handleViewAllGoals = () => {
    setShowViewGoals(true);
  };

  const handleEditGoal = (goal) => {
    console.log('Edit goal:', goal);
    setShowViewGoals(false);
    setShowSetGoal(true); 
  };


  const handleGoalSet = (goalData) => {
    console.log('Goal created:', goalData);

    fetchUserData();
  };
  const handleExpenseAdded = () => {
    console.log('Expense added, refreshing data...');
    fetchUserData();
  };

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

  const getSpendingPercentage = () => {
    if (currentMonth.budget === 0) return 0;
    return ((currentMonth.spent / currentMonth.budget) * 100).toFixed(1);
  };

  const getBudgetStatus = () => {
    const percentage = getSpendingPercentage();
    if (percentage < 70) return { color: 'text-green-400', status: 'Great' };
    if (percentage < 90) return { color: 'text-yellow-400', status: 'Good' };
    return { color: 'text-red-400', status: 'Caution' };
  };


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
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <motion.main
        className="max-w-7xl mx-auto px-6 py-8 pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {userData.name || 'User'}! {getGoalIcon(userData.primaryGoal)}
          </h2>
          <p className="text-blue-200 text-lg">
            Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>


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
              <span className="text-sm text-green-400">
                +{currentMonth.budget > 0 ? (((currentMonth.budget - currentMonth.spent) / currentMonth.budget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {getCurrencySymbol(userData.currency)}{Math.max(0, currentMonth.budget - currentMonth.spent).toLocaleString()}
            </h3>
            <p className="text-blue-200 text-sm">Remaining budget</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🤖 AI Insights
                <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Smart</span>
              </h3>
              <div className="space-y-3">
                {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
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
                )) : (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center text-blue-200">
                    No insights available yet. Complete some transactions to get personalized tips!
                  </div>
                )}
              </div>
            </motion.div>
            <GoalsOverviewSection
              userData={userData}
              onViewAllGoals={handleViewAllGoals}
              onCreateGoal={handleCreateGoal}
            />


            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Category Spending</h3>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  {categorySpending.length > 0 ? categorySpending.map((category, index) => (
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
                          animate={{ width: `${Math.min((category.spent / category.budget) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-blue-200">
                      No spending data available yet. Add some expenses to see your category breakdown!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>


          <div className="space-y-8">

            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={cardHover}
                  onClick={() => setShowAddExpense(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 flex items-center gap-3 hover:from-purple-600 hover:to-indigo-700 transition-all"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="font-medium">Add Expense</span>
                </motion.button>

                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">View Analytics</span>
                </button>

                <motion.button
                  whileHover={cardHover}
                  onClick={() => setShowSetGoal(true)} 
                  className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 flex items-center gap-3 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Set Goal</span>
                </motion.button>
              </div>
            </motion.div>


            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
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
                      <span className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {transaction.type === 'income' ? '+' : ''}{getCurrencySymbol(userData.currency)}{Math.abs(transaction.amount)}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center text-blue-200">
                      No transactions yet. Add your first expense to get started!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>


      {showAddExpense && (
        <AddExpense
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
      {showAnalytics && (
        <ViewAnalytics onClose={() => setShowAnalytics(false)} />
      )}
      {showSetGoal && (
        <SetGoal
          onClose={() => setShowSetGoal(false)}
          onGoalSet={handleGoalSet}
        />
      )}
      {showSetGoal && (
        <SetGoal
          onClose={() => setShowSetGoal(false)}
          onGoalSet={handleGoalSet}
        />
      )}

      {showViewGoals && (
        <ViewGoals
          onClose={() => setShowViewGoals(false)}
          onCreateGoal={handleCreateGoal}
          onEditGoal={handleEditGoal}
        />
      )}
    </div>
  );
}

export default ExpenseTrackerHome;