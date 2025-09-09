import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Send, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  PieChart,
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  Loader2,
  Database,
  Zap,
  ArrowRight,
  Star,
  Award,
  Clock,
  CreditCard,
  MapPin,
  Coffee,
  Car,
  ShoppingBag,
  Utensils,
  Home,
  Dumbbell,
  PlayCircle,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react';

const RAGMonthlyAnalyzer = () => {
  const [paragraph, setParagraph] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [structuredData, setStructuredData] = useState(null);
  const [ragContext, setRAGContext] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [dailySchedule, setDailySchedule] = useState(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  const sampleParagraph = `This month I spent around $450 on groceries at various stores like Walmart and Target. I also paid $85 for my phone bill, $120 for internet, and about $65 for electricity. For transportation, I filled up gas 4 times spending roughly $200 total at Shell and Chevron stations. I went out to eat about 6 times this month, spending approximately $180 on restaurants including Pizza Hut, Olive Garden, and some local places. I bought new clothes online from Amazon for $75, and got some household supplies for $45. I also paid for my gym membership which is $40 monthly, and spent about $25 on a movie night with friends. There were a few coffee runs throughout the month totaling around $35 at Starbucks.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paragraph.trim()) return;

    setIsProcessing(true);
    setShowResults(false);

    try {
      console.log('Sending paragraph for RAG analysis:', paragraph);
      
      const response = await fetch('http://localhost:3000/api/users/expenses/process-monthly-paragraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ paragraph: paragraph.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('RAG Analysis Response:', data);

      if (data.success) {
        setStructuredData(data.structuredData);
        setAnalysis(data.analysis);
        setRAGContext(data.ragContext);
        setShowResults(true);
        
        // Generate daily schedule after analysis
        await generateDailySchedule(data.structuredData, data.analysis);
      } else {
        throw new Error(data.message || 'Failed to process paragraph');
      }

    } catch (error) {
      console.error('Error processing paragraph:', error);
      alert(`Error: ${error.message}`);
    }

    setIsProcessing(false);
  };

  const generateDailySchedule = async (expenseData, analysisData) => {
    setIsGeneratingSchedule(true);
    
    // Simulate schedule generation based on expenses
    setTimeout(() => {
      const schedule = createOptimizedSchedule(expenseData, analysisData);
      setDailySchedule(schedule);
      setIsGeneratingSchedule(false);
    }, 2000);
  };

  const createOptimizedSchedule = (expenseData, analysisData) => {
    const activities = [];
    
    // Morning routine
    activities.push({
      time: '7:00 AM',
      icon: <Sunrise className="w-5 h-5 text-yellow-400" />,
      activity: 'Morning Routine',
      description: 'Wake up, personal hygiene, prepare for the day',
      category: 'Personal',
      duration: '60 min',
      cost: '$0',
      priority: 'high'
    });

    // Breakfast & Coffee
    const hasCoffeeExpenses = expenseData.monthlyExpenses.some(e => 
      e.description.toLowerCase().includes('coffee') || 
      e.description.toLowerCase().includes('starbucks')
    );
    
    if (hasCoffeeExpenses) {
      activities.push({
        time: '8:00 AM',
        icon: <Coffee className="w-5 h-5 text-amber-600" />,
        activity: 'Coffee & Breakfast',
        description: 'Based on your Starbucks visits - consider home brewing to save money',
        category: 'Food & Dining',
        duration: '30 min',
        cost: '$5-8',
        priority: 'medium',
        suggestion: 'Try making coffee at home 3 days/week to save ~$45/month'
      });
    }

    // Work commute
    const hasTransportExpenses = expenseData.monthlyExpenses.some(e => 
      e.category === 'Transportation'
    );
    
    if (hasTransportExpenses) {
      activities.push({
        time: '8:30 AM',
        icon: <Car className="w-5 h-5 text-blue-500" />,
        activity: 'Commute to Work',
        description: 'Based on your gas expenses - optimize routes for fuel efficiency',
        category: 'Transportation',
        duration: '30 min',
        cost: '$8-12',
        priority: 'high',
        suggestion: 'Consider carpooling 2 days/week to reduce gas costs'
      });
    }

    // Work hours
    activities.push({
      time: '9:00 AM - 5:00 PM',
      icon: <Target className="w-5 h-5 text-green-500" />,
      activity: 'Work/Productive Hours',
      description: 'Focus on income-generating activities',
      category: 'Work',
      duration: '8 hours',
      cost: '$0',
      priority: 'high'
    });

    // Lunch
    const hasDiningExpenses = expenseData.monthlyExpenses.some(e => 
      e.description.toLowerCase().includes('restaurant') || 
      e.description.toLowerCase().includes('dining')
    );
    
    if (hasDiningExpenses) {
      activities.push({
        time: '12:30 PM',
        icon: <Utensils className="w-5 h-5 text-red-500" />,
        activity: 'Lunch Break',
        description: 'Based on your dining out pattern - mix of home/restaurant meals',
        category: 'Food & Dining',
        duration: '60 min',
        cost: '$12-20',
        priority: 'medium',
        suggestion: 'Prepare lunch at home 3 times/week to save ~$120/month'
      });
    }

    // Evening commute
    if (hasTransportExpenses) {
      activities.push({
        time: '5:30 PM',
        icon: <Car className="w-5 h-5 text-blue-500" />,
        activity: 'Commute Home',
        description: 'Return trip - consider alternative routes during peak hours',
        category: 'Transportation',
        duration: '30 min',
        cost: '$8-12',
        priority: 'medium'
      });
    }

    // Grocery shopping
    const hasGroceryExpenses = expenseData.monthlyExpenses.some(e => 
      e.description.toLowerCase().includes('grocer') || 
      e.description.toLowerCase().includes('walmart') ||
      e.description.toLowerCase().includes('target')
    );
    
    if (hasGroceryExpenses) {
      activities.push({
        time: '6:30 PM',
        icon: <ShoppingBag className="w-5 h-5 text-purple-500" />,
        activity: 'Grocery Shopping (2-3x/week)',
        description: 'Based on your $450/month grocery spending - shop with a list',
        category: 'Shopping',
        duration: '45 min',
        cost: '$35-50',
        priority: 'medium',
        suggestion: 'Shop with a list and avoid impulse purchases'
      });
    }

    // Gym/fitness
    const hasGymExpenses = expenseData.monthlyExpenses.some(e => 
      e.description.toLowerCase().includes('gym') ||
      e.category === 'Healthcare'
    );
    
    if (hasGymExpenses) {
      activities.push({
        time: '7:30 PM',
        icon: <Dumbbell className="w-5 h-5 text-orange-500" />,
        activity: 'Gym/Fitness',
        description: 'Maximize your $40/month gym membership investment',
        category: 'Healthcare',
        duration: '60 min',
        cost: '$1.30/day',
        priority: 'high',
        suggestion: 'Attend 4+ times/week to get full value from membership'
      });
    }

    // Entertainment
    const hasEntertainmentExpenses = expenseData.monthlyExpenses.some(e => 
      e.category === 'Entertainment' ||
      e.description.toLowerCase().includes('movie')
    );
    
    if (hasEntertainmentExpenses) {
      activities.push({
        time: '8:30 PM',
        icon: <PlayCircle className="w-5 h-5 text-pink-500" />,
        activity: 'Entertainment/Social (2-3x/week)',
        description: 'Based on your movie nights - balance social life and budget',
        category: 'Entertainment',
        duration: '90 min',
        cost: '$15-25',
        priority: 'low',
        suggestion: 'Try free/low-cost activities like parks, hiking, or home movie nights'
      });
    }

    // Bill payments
    const hasBillExpenses = expenseData.monthlyExpenses.some(e => 
      e.category === 'Bills & Utilities'
    );
    
    if (hasBillExpenses) {
      activities.push({
        time: '9:00 PM',
        icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
        activity: 'Bill Management (Weekly review)',
        description: 'Review and schedule your monthly bills ($270 total)',
        category: 'Bills & Utilities',
        duration: '15 min',
        cost: 'Variable',
        priority: 'high',
        suggestion: 'Set up autopay for consistent bills to avoid late fees'
      });
    }

    // Wind down
    activities.push({
      time: '10:00 PM',
      icon: <Moon className="w-5 h-5 text-blue-300" />,
      activity: 'Wind Down & Planning',
      description: 'Review daily expenses, plan tomorrow, relaxation',
      category: 'Personal',
      duration: '60 min',
      cost: '$0',
      priority: 'medium'
    });

    const dailyCostEstimate = expenseData.totalAmount / 30;
    
    return {
      activities,
      dailyStats: {
        totalActivities: activities.length,
        estimatedDailyCost: dailyCostEstimate,
        highPriorityTasks: activities.filter(a => a.priority === 'high').length,
        savingOpportunities: activities.filter(a => a.suggestion).length
      },
      insights: [
        `Your daily spending averages $${dailyCostEstimate.toFixed(2)}`,
        `${activities.filter(a => a.suggestion).length} activities have cost-saving opportunities`,
        'Schedule includes time for all major expense categories from your data'
      ]
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 border-green-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                RAG Monthly Analyzer & Daily Planner
              </h1>
            </div>
          </div>
          <p className="text-xl text-blue-200 mb-6 max-w-3xl mx-auto">
            Describe your monthly expenses and get personalized insights plus an optimized daily schedule 
            based on your spending patterns and lifestyle.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl mb-8"
        >
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Monthly Expense Description</h2>
            </div>
            <p className="text-sm text-blue-200 mt-2">
              Describe all your monthly expenses in natural language. Include amounts, categories, and details.
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <textarea
                value={paragraph}
                onChange={(e) => setParagraph(e.target.value)}
                placeholder="Example: This month I spent around $450 on groceries at various stores like Walmart and Target..."
                className="w-full h-40 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none backdrop-blur-md"
                maxLength={2000}
                disabled={isProcessing}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-white/60">{paragraph.length}/2000 characters</span>
                <button
                  type="button"
                  onClick={() => setParagraph(sampleParagraph)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Use sample text
                </button>
              </div>
            </div>
            
            <motion.button
              onClick={handleSubmit}
              disabled={!paragraph.trim() || isProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl px-6 py-4 font-semibold transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI & RAG...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze & Generate Daily Schedule
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && structuredData && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-8"
            >
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold">${structuredData.totalAmount}</p>
                      <p className="text-sm text-blue-200">Total Spent</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold">{structuredData.expenseCount}</p>
                      <p className="text-sm text-blue-200">Transactions</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <PieChart className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold">{structuredData.categories.length}</p>
                      <p className="text-sm text-blue-200">Categories</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Star className={`w-8 h-8 ${getScoreColor(analysis.financialHealthScore.score)}`} />
                    <div>
                      <p className="text-2xl font-bold">{analysis.financialHealthScore.score}/10</p>
                      <p className="text-sm text-blue-200">Health Score</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Daily Schedule Generation Loading */}
              <AnimatePresence>
                {isGeneratingSchedule && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center"
                  >
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Generating Your Optimized Daily Schedule...</h3>
                    <p className="text-blue-200">Analyzing your spending patterns to create a personalized daily routine</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generated Daily Schedule */}
              <AnimatePresence>
                {dailySchedule && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-green-400" />
                        <h3 className="text-2xl font-bold">Your Optimized Daily Schedule</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-200">Daily Budget</p>
                        <p className="text-xl font-bold text-green-400">
                          ${dailySchedule.dailyStats.estimatedDailyCost.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Schedule Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{dailySchedule.dailyStats.totalActivities}</p>
                        <p className="text-sm text-blue-200">Daily Activities</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{dailySchedule.dailyStats.highPriorityTasks}</p>
                        <p className="text-sm text-blue-200">High Priority</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{dailySchedule.dailyStats.savingOpportunities}</p>
                        <p className="text-sm text-blue-200">Saving Tips</p>
                      </div>
                    </div>

                    {/* Daily Activities Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold mb-4">Daily Timeline</h4>
                      {dailySchedule.activities.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${getPriorityColor(activity.priority)} border rounded-xl p-4 backdrop-blur-sm`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="flex items-center gap-2">
                                {activity.icon}
                                <span className="font-mono text-sm font-semibold text-purple-300">
                                  {activity.time}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-lg">{activity.activity}</h5>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="bg-white/10 px-2 py-1 rounded">{activity.duration}</span>
                                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">{activity.cost}</span>
                                </div>
                              </div>
                              
                              <p className="text-blue-200 text-sm mb-2">{activity.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                                  {activity.category}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  activity.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                  activity.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {activity.priority} priority
                                </span>
                              </div>
                              
                              {activity.suggestion && (
                                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-200">{activity.suggestion}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Schedule Insights */}
                    <div className="mt-6 bg-white/5 rounded-xl p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Schedule Insights
                      </h4>
                      <div className="space-y-2">
                        {dailySchedule.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-200">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* RAG Context Info */}
              {ragContext && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Database className="w-4 h-4" />
                    <span>
                      Analysis and schedule based on {ragContext.totalSimilarExpenses} historical transactions across {ragContext.categories.length} categories
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RAGMonthlyAnalyzer;