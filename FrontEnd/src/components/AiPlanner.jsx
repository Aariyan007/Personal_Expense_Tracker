import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Brain, 
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Tag,
  ArrowLeft,
  Lightbulb,
  PieChart,
  Target,
  Zap,
  Save,
  Database,
  Download
} from 'lucide-react';

const AiPlanner = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [savedExpenses, setSavedExpenses] = useState([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Sample initial message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: "👋 Hi there! I'm your AI Financial Assistant. Tell me about your daily expenses in natural language - like 'I spent $25 on groceries at Walmart today' or 'Had lunch with friends for $18 at that new restaurant'. I'll help you track, categorize, and analyze your spending patterns!",
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Load expenses from backend
    loadExpensesFromBackend();
  }, []);

  const loadExpensesFromBackend = async () => {
    try {
      const response = await fetch('/api/users/expenses/ai-processed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedExpenses = data.expenses.map(expense => ({
          id: expense._id,
          originalText: expense.originalText,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          confidence: expense.confidence,
          timestamp: expense.date,
          date: new Date(expense.date).toDateString(),
          parsedData: {
            merchant: expense.merchant,
            paymentMethod: 'Card', // Default since not stored
            location: expense.location,
            tags: expense.tags || []
          },
          saved: true
        }));
        
        setSavedExpenses(formattedExpenses);
        console.log('Loaded expenses from backend:', formattedExpenses);
      } else {

        const saved = JSON.parse(localStorage.getItem('savedExpenses') || '[]');
        setSavedExpenses(saved);
        console.log('Loaded expenses from localStorage as fallback');
      }
    } catch (error) {
      console.error('Error loading expenses from backend:', error);

      const saved = JSON.parse(localStorage.getItem('savedExpenses') || '[]');
      setSavedExpenses(saved);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Console log the user input for development
    console.log('User Input:', {
      text: input.trim(),
      timestamp: new Date().toISOString(),
      messageId: userMessage.id
    });

    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {

      const response = await fetch('/api/users/expenses/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ text: userMessage.content })
      });

      const data = await response.json();

      let aiResponse;
      if (data.success && data.analysis.isExpense) {
        aiResponse = {
          id: Date.now(),
          type: 'ai',
          content: data.message,
          analysis: data.analysis,
          originalText: userMessage.content,
          timestamp: new Date().toISOString()
        };
        setCurrentAnalysis(data.analysis);
      } else {
        aiResponse = {
          id: Date.now(),
          type: 'ai',
          content: data.message || "I couldn't detect expense information. Could you provide more details?",
          timestamp: new Date().toISOString()
        };
      }

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback to local processing if API fails
      const aiResponse = processExpenseInput(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
    }

    setIsLoading(false);
    setIsTyping(false);
  };

  const saveExpenseData = (analysis, originalText) => {
    const expenseData = {
      id: Date.now(),
      originalText: originalText,
      amount: analysis.amount,
      category: analysis.category,
      description: analysis.description,
      confidence: analysis.confidence,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
      // Additional fields for RAG model preparation
      parsedData: {
        merchant: extractMerchant(originalText),
        paymentMethod: extractPaymentMethod(originalText),
        location: extractLocation(originalText),
        tags: generateTags(originalText, analysis.category)
      }
    };

    // Save to state
    const updatedExpenses = [...savedExpenses, expenseData];
    setSavedExpenses(updatedExpenses);
    
    // Save to localStorage (temporary storage)
    localStorage.setItem('savedExpenses', JSON.stringify(updatedExpenses));
    
    // Console log for development
    console.log('Saved Expense Data:', expenseData);
    console.log('All Saved Expenses:', updatedExpenses);
    
    // Show success message
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
    
    return expenseData;
  };

  const extractMerchant = (text) => {
    const merchants = ['walmart', 'target', 'amazon', 'starbucks', 'mcdonalds', 'shell', 'costco'];
    const found = merchants.find(merchant => 
      text.toLowerCase().includes(merchant)
    );
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : null;
  };

  const extractPaymentMethod = (text) => {
    if (/cash/i.test(text)) return 'Cash';
    if (/card|debit|credit/i.test(text)) return 'Card';
    if (/venmo|paypal|zelle/i.test(text)) return 'Digital';
    return 'Unknown';
  };

  const extractLocation = (text) => {
    // Simple location extraction - you can enhance this
    const locationKeywords = ['at', 'from', 'in'];
    for (let keyword of locationKeywords) {
      const regex = new RegExp(`${keyword}\\s+([\\w\\s]+?)(?:\\s+(?:today|yesterday|for|\\$)|$)`, 'i');
      const match = text.match(regex);
      if (match) return match[1].trim();
    }
    return null;
  };

  const generateTags = (text, category) => {
    const tags = [];
    tags.push(category.toLowerCase().replace(/\s+/g, '_'));
    
    if (/lunch|dinner|breakfast/i.test(text)) tags.push('meal');
    if (/online|internet|website/i.test(text)) tags.push('online');
    if (/urgent|emergency/i.test(text)) tags.push('urgent');
    if (/work|office/i.test(text)) tags.push('work_related');
    
    return tags;
  };

  const processExpenseInput = (text) => {
    // Mock AI processing - extract expense details
    const amounts = [...text.matchAll(/\$(\d+(?:\.\d{2})?)/g)];
    const hasExpenseKeywords = /spent|paid|bought|purchase|cost/i.test(text);
    const category = determineCategory(text);
    
    if (amounts.length > 0 && hasExpenseKeywords) {
      const amount = amounts[0][1];
      const analysis = {
        amount: parseFloat(amount),
        category: category,
        description: text,
        confidence: 0.85,
        suggestions: generateSuggestions(category, parseFloat(amount))
      };

      setCurrentAnalysis(analysis);

      return {
        id: Date.now(),
        type: 'ai',
        content: `Great! I detected an expense of $${amount} in the ${category} category. I've automatically categorized this for you. Click "Save Expense" to add it to your records.`,
        analysis: analysis,
        originalText: text,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        id: Date.now(),
        type: 'ai',
        content: "I'd love to help you track that expense! Could you provide more details like the amount you spent? For example: 'I spent $20 on coffee this morning' or 'Paid $50 for gas today'.",
        timestamp: new Date().toISOString()
      };
    }
  };

  const determineCategory = (text) => {
    if (/grocery|groceries|food|restaurant|lunch|dinner|coffee|eating/i.test(text)) return 'Food & Dining';
    if (/gas|fuel|uber|taxi|transport|car|parking/i.test(text)) return 'Transportation';
    if (/shopping|clothes|amazon|store|buy|purchase/i.test(text)) return 'Shopping';
    if (/rent|mortgage|utilities|electric|water/i.test(text)) return 'Bills & Utilities';
    if (/movie|entertainment|game|fun/i.test(text)) return 'Entertainment';
    if (/health|doctor|medicine|pharmacy/i.test(text)) return 'Healthcare';
    return 'Other';
  };

  const generateSuggestions = (category, amount) => {
    const suggestions = {
      'Food & Dining': [
        'Consider meal prepping to reduce dining out costs',
        'Track your monthly food budget to stay on target',
        'Look for restaurant deals and happy hour specials'
      ],
      'Transportation': [
        'Consider carpooling or public transport for savings',
        'Track fuel efficiency and compare gas prices',
        'Combine trips to reduce overall transport costs'
      ],
      'Shopping': [
        'Wait 24 hours before non-essential purchases',
        'Compare prices across different retailers',
        'Set a monthly shopping budget limit'
      ]
    };
    return suggestions[category] || ['Great job tracking your expenses!'];
  };

  const handleSaveExpense = async (analysis, originalText) => {
    try {
      setShowSaveSuccess(false); // Reset any previous success state

      const response = await fetch('/api/users/expenses/save-processed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add your auth token
        },
        body: JSON.stringify({ 
          analysisData: {
            ...analysis,
            originalText: originalText
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage and state
        const expenseData = {
          id: data.expense._id,
          originalText: originalText,
          amount: analysis.amount,
          category: analysis.category,
          description: analysis.description,
          confidence: analysis.confidence,
          timestamp: new Date().toISOString(),
          date: new Date().toDateString(),
          parsedData: {
            merchant: analysis.merchant,
            paymentMethod: analysis.paymentMethod,
            location: analysis.location,
            tags: analysis.tags
          },
          saved: true // Mark as saved to backend
        };

        const updatedExpenses = [...savedExpenses, expenseData];
        setSavedExpenses(updatedExpenses);
        
        // Keep localStorage as backup
        localStorage.setItem('savedExpenses', JSON.stringify(updatedExpenses));
        
        console.log('Expense saved to backend:', data.expense);
        console.log('Updated local expenses:', updatedExpenses);
        
        // Show success message
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Failed to save expense');
      }

    } catch (error) {
      console.error('Save expense error:', error);
      
      // Fallback to local storage if backend fails
      const savedData = saveExpenseData(analysis, originalText);
      console.log('Saved to local storage as fallback:', savedData);
      
      // Still show success, but maybe different message
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const exportDataAsJSON = () => {
    const jsonData = JSON.stringify(savedExpenses, null, 2);
    console.log('Exported JSON Data:', jsonData);
    
    // Create downloadable file
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const examplePrompts = [
    "I spent $45 on groceries at Target today",
    "Had coffee with Sarah for $8 at Starbucks",
    "Paid $60 for gas at Shell station",
    "Bought a new shirt online for $25"
  ];

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

  const messageVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 120, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white ">
      {/* Success Toast */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Expense saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        className="max-w-6xl mx-auto px-6 py-8 pt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mt-20">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2 mt-20">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                AI-PLANNER
              </h1>
            </div>
          </div>
          <p className="text-xl text-blue-200 mb-6 max-w-2xl mx-auto">
            Your intelligent expense tracking assistant. Just describe your spending in natural language, 
            and I'll automatically categorize and analyze your expenses.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-sm">Saved: {savedExpenses.length}</span>
              </div>
            </div>
            <button
              onClick={exportDataAsJSON}
              className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Export JSON</span>
            </button>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <motion.div 
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Smart Recognition</h3>
              <p className="text-sm text-blue-200">Automatically detects amounts and categories</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <PieChart className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Instant Analysis</h3>
              <p className="text-sm text-blue-200">Real-time spending insights and patterns</p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <Save className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Data Persistence</h3>
              <p className="text-sm text-blue-200">Saves all expense data for analysis</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div 
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl"
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">AI Assistant</h2>
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online & Ready
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                      : 'bg-white/10 border border-white/20 text-white'
                  }`}>
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.analysis && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20"
                      >
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-xs">Amount: ${message.analysis.amount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-400" />
                            <span className="text-xs">{message.analysis.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-xs">Confidence: {(message.analysis.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <button 
                          onClick={() => handleSaveExpense(message.analysis, message.originalText)}
                          className="w-full bg-gradient-to-r from-green-500/50 to-emerald-600/50 rounded-lg p-2 text-xs hover:from-green-500/70 hover:to-emerald-600/70 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-3 h-3" />
                          Save Expense
                        </button>
                      </motion.div>
                    )}
                    
                    <div className="text-xs text-white/60 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Example Prompts */}
          {messages.length <= 1 && (
            <motion.div 
              variants={itemVariants}
              className="px-6 pb-4"
            >
              <p className="text-sm text-blue-200 mb-3">Try these examples:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examplePrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput(prompt)}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2 text-purple-400" />
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Form */}
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Describe your expense... 'I spent $25 on groceries at Walmart today'"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[50px] max-h-[120px] backdrop-blur-md"
                  rows="2"
                  disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2 text-xs text-white/40">
                  {input.length}/500
                </div>
              </div>
              <motion.button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl px-6 py-3 font-medium transition-all flex items-center gap-2 disabled:cursor-not-allowed min-w-[120px] justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Analysis Panel */}
        {currentAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Smart Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  Expense Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Amount:</span>
                    <span className="font-semibold">${currentAnalysis.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Category:</span>
                    <span className="font-semibold">{currentAnalysis.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Confidence:</span>
                    <span className="font-semibold">{(currentAnalysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Suggestions
                </h4>
                <ul className="space-y-1 text-sm">
                  {currentAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-200">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Data Preview */}
        {savedExpenses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Recent Saved Expenses
            </h3>
            <div className="space-y-3">
              {savedExpenses.slice(-3).reverse().map((expense) => (
                <div key={expense.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-green-400">${expense.amount}</span>
                    <span className="text-xs text-blue-200">{expense.date}</span>
                  </div>
                  <p className="text-sm text-white/80 mb-1">{expense.originalText}</p>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{expense.category}</span>
                    <span>{expense.confidence * 100}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AiPlanner;