import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Target,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ViewAnalytics = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    totalIncome: 0,
    avgDailySpending: 0,
    highestExpenseDay: 0,
    categoryBreakdown: [],
    spendingTrend: [],
    monthlyComparison: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_BASE_URL;
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsLoading(false);
        return;
      }

      if (!baseUrl) {
        setError('Base URL not configured. Check your environment settings.');
        setIsLoading(false);
        return;
      }

      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Calculate date range based on filter
      const now = new Date();
      let startDate, endDate;
      
      switch (timeFilter) {
        case 'thisWeek':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          endDate = now;
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = now;
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }

      try {
        // Try to fetch recent transactions first (this endpoint exists in your home component)
        const transResponse = await fetch(`${baseUrl}/user/transactions/recent`, config);
        
        if (transResponse.ok) {
          const transData = await transResponse.json();
          setExpenses(transData || []);
          processAnalyticsData(transData || [], startDate, endDate);
        } else {
          throw new Error('Failed to fetch transaction data');
        }

        // Try to fetch additional data if endpoints exist
        try {
          const categoryResponse = await fetch(`${baseUrl}/user/category-spending`, config);
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            // Update analytics with category data if available
            setAnalytics(prev => ({
              ...prev,
              categoryBreakdown: categoryData || []
            }));
          }
        } catch (err) {
          console.log('Category spending endpoint not available');
        }

        try {
          const monthlyResponse = await fetch(`${baseUrl}/user/monthly-summary`, config);
          if (monthlyResponse.ok) {
            const monthlyData = await monthlyResponse.json();
            // Update analytics with monthly data if available
            setAnalytics(prev => ({
              ...prev,
              totalIncome: monthlyData.income || 0,
              totalSpent: monthlyData.spent || 0
            }));
          }
        } catch (err) {
          console.log('Monthly summary endpoint not available');
        }
        
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('Unable to load analytics data. Using sample data for demonstration.');
        
        // Use sample data for demonstration
        const sampleData = generateSampleData();
        setExpenses(sampleData);
        processAnalyticsData(sampleData, startDate, endDate);
      }
      
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('Unable to load analytics data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = () => {
    const categories = ['food', 'transportation', 'entertainment', 'utilities', 'shopping'];
    const sampleTransactions = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      sampleTransactions.push({
        _id: `sample_${i}`,
        description: `Sample Transaction ${i + 1}`,
        amount: Math.random() * 200 + 10,
        category: categories[Math.floor(Math.random() * categories.length)],
        type: Math.random() > 0.1 ? 'expense' : 'income',
        date: date.toISOString()
      });
    }
    
    return sampleTransactions;
  };

  const processAnalyticsData = (expensesData, startDate, endDate) => {
    // Ensure expensesData is an array
    const validExpenses = Array.isArray(expensesData) ? expensesData : [];
    
    // Basic calculations
    const totalSpent = validExpenses
      .filter(exp => exp && exp.type === 'expense')
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    
    const totalIncome = validExpenses
      .filter(exp => exp && exp.type === 'income')
      .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    const daysInPeriod = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const avgDailySpending = daysInPeriod > 0 ? totalSpent / daysInPeriod : 0;

    // Category breakdown
    const categoryMap = {};
    validExpenses
      .filter(exp => exp && exp.type === 'expense' && exp.amount)
      .forEach(exp => {
        const category = exp.category ? exp.category.charAt(0).toUpperCase() + exp.category.slice(1) : 'Other';
        const amount = Number(exp.amount) || 0;
        categoryMap[category] = (categoryMap[category] || 0) + amount;
      });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({ 
        name: name || 'Other', 
        value: Math.round((Number(value) || 0) * 100) / 100 
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Daily spending trend
    const dailySpending = {};
    validExpenses
      .filter(exp => exp && exp.type === 'expense' && exp.amount && exp.date)
      .forEach(exp => {
        try {
          const date = new Date(exp.date).toLocaleDateString();
          const amount = Number(exp.amount) || 0;
          dailySpending[date] = (dailySpending[date] || 0) + amount;
        } catch (error) {
          console.warn('Invalid date in expense:', exp.date);
        }
      });

    const spendingTrend = Object.entries(dailySpending)
      .map(([date, amount]) => ({ 
        date, 
        amount: Math.round((Number(amount) || 0) * 100) / 100 
      }))
      .sort((a, b) => {
        try {
          return new Date(a.date) - new Date(b.date);
        } catch {
          return 0;
        }
      })
      .slice(-15); // Last 15 data points

    const dailyAmounts = Object.values(dailySpending).map(val => Number(val) || 0);
    const highestExpenseDay = dailyAmounts.length > 0 ? Math.max(...dailyAmounts) : 0;

    // Monthly comparison (last 6 months)
    const monthlyData = {};
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      try {
        const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        last6Months.push(monthKey);
        monthlyData[monthKey] = { expenses: 0, income: 0 };
      } catch (error) {
        console.warn('Error creating month data for index:', i);
      }
    }

    validExpenses.forEach(exp => {
      if (!exp || !exp.date || !exp.amount) return;
      
      try {
        const expDate = new Date(exp.date);
        const monthKey = expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const amount = Number(exp.amount) || 0;
        
        if (monthlyData[monthKey]) {
          if (exp.type === 'expense') {
            monthlyData[monthKey].expenses += amount;
          } else if (exp.type === 'income') {
            monthlyData[monthKey].income += amount;
          }
        }
      } catch (error) {
        console.warn('Error processing expense for monthly data:', exp);
      }
    });

    const monthlyComparison = last6Months.map(month => ({
      month,
      expenses: Math.round((monthlyData[month]?.expenses || 0)),
      income: Math.round((monthlyData[month]?.income || 0)),
      net: Math.round((monthlyData[month]?.income || 0) - (monthlyData[month]?.expenses || 0))
    }));

    setAnalytics({
      totalSpent: Math.max(0, Math.round(totalSpent * 100) / 100),
      totalIncome: Math.max(0, Math.round(totalIncome * 100) / 100),
      avgDailySpending: Math.max(0, Math.round(avgDailySpending * 100) / 100),
      highestExpenseDay: Math.max(0, Math.round(highestExpenseDay * 100) / 100),
      categoryBreakdown: categoryBreakdown || [],
      spendingTrend: spendingTrend || [],
      monthlyComparison: monthlyComparison || []
    });
  };

  const COLORS = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', 
    '#EF4444', '#EC4899', '#6366F1', '#84CC16'
  ];

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isActive
          ? 'bg-purple-500 text-white shadow-lg'
          : 'bg-white/10 text-blue-200 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ title, value, icon, change, changeType }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 ${
            changeType === 'positive' ? 'text-green-400' : 'text-red-400'
          }`}>
            {changeType === 'positive' ? 
              <ArrowUpRight className="w-4 h-4" /> : 
              <ArrowDownRight className="w-4 h-4" />
            }
            <span className="text-sm">{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">${value}</h3>
      <p className="text-blue-200 text-sm">{title}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && analytics.totalSpent === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Load Analytics</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => fetchAnalyticsData()}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/home')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className="text-blue-200">Detailed insights into your spending patterns</p>
              </div>
            </div>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            <TabButton
              id="overview"
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="trends"
              label="Trends"
              isActive={activeTab === 'trends'}
              onClick={setActiveTab}
            />
            
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-200" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>

        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Spent"
                  value={analytics.totalSpent.toLocaleString()}
                  icon={<TrendingDown className="w-6 h-6 text-red-400" />}
                />
                <StatCard
                  title="Total Income"
                  value={analytics.totalIncome.toLocaleString()}
                  icon={<TrendingUp className="w-6 h-6 text-green-400" />}
                />
                <StatCard
                  title="Daily Average"
                  value={analytics.avgDailySpending.toFixed(2)}
                  icon={<Calendar className="w-6 h-6 text-blue-400" />}
                />
                <StatCard
                  title="Highest Day"
                  value={analytics.highestExpenseDay.toFixed(2)}
                  icon={<Target className="w-6 h-6 text-purple-400" />}
                />
              </div>

              {/* Monthly Comparison Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Monthly Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="income" fill="#10B981" name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-8">
              {/* Spending Trend Line Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Daily Spending Trend</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#A78BFA' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Transactions Table */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {expenses.slice(0, 10).map((expense, index) => (
                    <div key={expense._id || index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          expense.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {expense.type === 'income' ? 
                            <ArrowUpRight className="w-4 h-4 text-green-400" /> :
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{expense.description || expense.desc || 'Transaction'}</p>
                          <p className="text-sm text-blue-200 capitalize">{expense.category || 'General'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          expense.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {expense.type === 'income' ? '+' : '-'}${(expense.amount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-200">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-center text-blue-200 py-8">
                      No transactions available yet. Start adding expenses to see your analytics!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Pie Chart */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Spending by Category</h3>
                {analytics.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {analytics.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${(value || 0).toFixed(2)}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-blue-200 py-8">
                    No category data available yet. Add expenses to see the breakdown!
                  </div>
                )}
              </div>

              {/* Category List */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {analytics.categoryBreakdown.length > 0 ? 
                    analytics.categoryBreakdown.map((category, index) => (
                      <div key={`${category.name}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(category.value || 0).toFixed(2)}</p>
                          <p className="text-xs text-blue-200">
                            {analytics.totalSpent > 0 ? (((category.value || 0) / analytics.totalSpent) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-blue-200 py-8">
                        No categories to display yet. Start adding expenses with categories!
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAnalytics;