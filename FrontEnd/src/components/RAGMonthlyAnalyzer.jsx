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
  CreditCard
} from 'lucide-react';

const RAGMonthlyAnalyzer = () => {
  const [paragraph, setParagraph] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [structuredData, setStructuredData] = useState(null);
  const [ragContext, setRAGContext] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Sample paragraph for demo
  const sampleParagraph = `This month I spent around $450 on groceries at various stores like Walmart and Target. I also paid $85 for my phone bill, $120 for internet, and about $65 for electricity. For transportation, I filled up gas 4 times spending roughly $200 total at Shell and Chevron stations. I went out to eat about 6 times this month, spending approximately $180 on restaurants including Pizza Hut, Olive Garden, and some local places. I bought new clothes online from Amazon for $75, and got some household supplies for $45. I also paid for my gym membership which is $40 monthly, and spent about $25 on a movie night with friends. There were a few coffee runs throughout the month totaling around $35 at Starbucks.`;

  // Updated handleSubmit function with correct API endpoint
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paragraph.trim()) return;
  
    setIsProcessing(true);
    setShowResults(false);
  
    try {
      console.log('Sending paragraph for RAG analysis:', paragraph);
      
      // FIXED: Correct API endpoint to match your routes
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
      } else {
        throw new Error(data.message || 'Failed to process paragraph');
      }
  
    } catch (error) {
      console.error('Error processing paragraph:', error);
      alert(`Error: ${error.message}`);
    }
  
    setIsProcessing(false);
  };

  const setMockData = () => {
    // Mock data for demonstration
    setStructuredData({
      monthlyExpenses: [
        { description: 'Groceries at various stores', amount: 450, category: 'Food & Dining', confidence: 0.95 },
        { description: 'Phone bill payment', amount: 85, category: 'Bills & Utilities', confidence: 0.98 },
        { description: 'Internet service', amount: 120, category: 'Bills & Utilities', confidence: 0.98 },
        { description: 'Electricity bill', amount: 65, category: 'Bills & Utilities', confidence: 0.95 },
        { description: 'Gas station fill-ups', amount: 200, category: 'Transportation', confidence: 0.90 },
        { description: 'Restaurant dining', amount: 180, category: 'Food & Dining', confidence: 0.85 },
        { description: 'Clothing purchase online', amount: 75, category: 'Shopping', confidence: 0.92 },
        { description: 'Household supplies', amount: 45, category: 'Shopping', confidence: 0.90 },
        { description: 'Gym membership', amount: 40, category: 'Healthcare', confidence: 0.98 },
        { description: 'Movie night entertainment', amount: 25, category: 'Entertainment', confidence: 0.88 },
        { description: 'Coffee runs', amount: 35, category: 'Food & Dining', confidence: 0.85 }
      ],
      totalAmount: 1320,
      expenseCount: 11,
      categories: ['Food & Dining', 'Bills & Utilities', 'Transportation', 'Shopping', 'Healthcare', 'Entertainment'],
      timeframe: 'monthly'
    });

    setAnalysis({
      spendingAnalysis: {
        monthlyComparison: 'Your spending this month ($1,320) is 8% higher than your historical average of $1,220. This increase is primarily due to higher grocery spending and additional restaurant visits.',
        categoryTrends: [
          'Food & Dining increased by 15% compared to last month',
          'Bills & Utilities remained consistent with previous patterns',
          'Transportation costs are within normal range'
        ],
        anomalies: ['Unusually high grocery spending', 'More frequent dining out than typical'],
        totalSpentComparison: 'Total spending is $100 above your monthly average'
      },
      personalizedInsights: {
        budgetRecommendations: [
          'Consider setting a $400 monthly grocery budget',
          'Limit dining out to 4 times per month to save $60',
          'Your utilities are well-managed - continue current patterns'
        ],
        categoryAdvice: {
          'Food & Dining': 'Try meal planning to reduce grocery costs and dining frequency',
          'Transportation': 'Your gas spending is reasonable for your driving patterns',
          'Bills & Utilities': 'All utility payments are on track'
        },
        savingsOpportunities: [
          'Reduce grocery spending by $50/month through meal planning',
          'Cut dining out budget by $40/month',
          'Consider bundling internet and phone for potential savings'
        ]
      },
      predictions: {
        nextMonthExpected: 1280,
        upcomingExpenses: [
          'Similar utility bills (~$270)',
          'Grocery spending likely to normalize (~$400)',
          'Gym membership renewal due'
        ],
        budgetAdjustments: [
          'Set stricter grocery budget',
          'Plan dining out occasions in advance',
          'Continue current transportation spending'
        ]
      },
      financialHealthScore: {
        score: 7.5,
        strengths: [
          'Consistent bill payments',
          'Reasonable transportation costs',
          'Good tracking of expenses'
        ],
        improvements: [
          'Better food budget control',
          'More strategic dining out',
          'Consider increasing emergency savings'
        ],
        summary: 'Your financial habits are generally solid with room for improvement in food spending control.'
      },
      actionableSteps: [
        'Set a $400 monthly grocery budget and stick to it',
        'Plan dining out occasions - limit to 4 times per month',
        'Review and optimize utility bills quarterly',
        'Continue tracking all expenses for better insights'
      ]
    });

    setRAGContext({
      totalSimilarExpenses: 127,
      categories: ['Food & Dining', 'Bills & Utilities', 'Transportation', 'Shopping', 'Healthcare', 'Entertainment']
    });
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

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Dining': return <CreditCard className="w-4 h-4" />;
      case 'Transportation': return <Target className="w-4 h-4" />;
      case 'Shopping': return <BarChart3 className="w-4 h-4" />;
      case 'Bills & Utilities': return <Zap className="w-4 h-4" />;
      case 'Entertainment': return <Star className="w-4 h-4" />;
      case 'Healthcare': return <Award className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                RAG Monthly Analyzer
              </h1>
            </div>
          </div>
          <p className="text-xl text-blue-200 mb-6 max-w-3xl mx-auto">
            Describe your monthly expenses in a paragraph, and our AI will analyze your spending patterns 
            using your historical data to provide personalized insights and recommendations.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl mb-8"
        >
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Monthly Expense Description</h2>
            </div>
            <p className="text-sm text-blue-200 mt-2">
              Describe all your monthly expenses in natural language. Include amounts, categories, and any details you remember.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <textarea
                value={paragraph}
                onChange={(e) => setParagraph(e.target.value)}
                placeholder="Example: This month I spent around $450 on groceries at various stores like Walmart and Target. I also paid $85 for my phone bill, $120 for internet..."
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
              type="submit"
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
                  Analyze Monthly Expenses
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
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
                  variants={itemVariants}
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
                  variants={itemVariants}
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
                  variants={itemVariants}
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
                  variants={itemVariants}
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

              {/* Expense Breakdown */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Extracted Expenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {structuredData.monthlyExpenses.map((expense, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(expense.category)}
                          <span className="font-semibold text-green-400">${expense.amount}</span>
                        </div>
                        <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                          {expense.category}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 mb-1">{expense.description}</p>
                      <div className="flex justify-between text-xs text-white/60">
                        <span>Confidence: {(expense.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* RAG Analysis */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  AI-Powered Spending Analysis
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Comparison */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Monthly Comparison
                    </h4>
                    <p className="text-sm text-blue-200 mb-3">{analysis.spendingAnalysis.monthlyComparison}</p>
                    <div className="space-y-2">
                      {analysis.spendingAnalysis.categoryTrends.map((trend, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{trend}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Anomalies */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Spending Anomalies
                    </h4>
                    <div className="space-y-2">
                      {analysis.spendingAnalysis.anomalies.map((anomaly, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <AlertTriangle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{anomaly}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Personalized Insights */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Personalized Insights & Recommendations
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Budget Recommendations */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 text-green-400">Budget Recommendations</h4>
                    <div className="space-y-2">
                      {analysis.personalizedInsights.budgetRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Savings Opportunities */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 text-purple-400">Savings Opportunities</h4>
                    <div className="space-y-2">
                      {analysis.personalizedInsights.savingsOpportunities.map((opp, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <DollarSign className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Month Predictions */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 text-blue-400">Next Month Forecast</h4>
                    <p className="text-lg font-bold text-blue-400 mb-2">
                      ${analysis.predictions.nextMonthExpected}
                    </p>
                    <div className="space-y-2">
                      {analysis.predictions.upcomingExpenses.slice(0, 3).map((expense, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <Clock className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{expense}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Financial Health Score */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Financial Health Assessment
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getScoreColor(analysis.financialHealthScore.score)} mb-2`}>
                        {analysis.financialHealthScore.score}
                      </div>
                      <div className="text-white/60">out of 10</div>
                      <p className="text-sm text-blue-200 mt-4">
                        {analysis.financialHealthScore.summary}
                      </p>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-green-400">Strengths</h4>
                      <div className="space-y-2">
                        {analysis.financialHealthScore.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-200">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-yellow-400">Areas for Improvement</h4>
                      <div className="space-y-2">
                        {analysis.financialHealthScore.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Target className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-200">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Steps */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Next Action Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.actionableSteps.map((step, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-purple-500/10 to-indigo-600/10 rounded-xl p-4 border border-purple-500/20 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{step}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* RAG Context Info */}
              {ragContext && (
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4"
                >
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Database className="w-4 h-4" />
                    <span>
                      Analysis based on {ragContext.totalSimilarExpenses} historical transactions across {ragContext.categories.length} categories
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