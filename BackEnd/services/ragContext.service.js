const Expense = require('../models/ExpenseSchema');
const AIExpense = require('../models/aiExpense.model');

class RAGContextService {
  constructor() {
    this.contextCache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Retrieve contextual expenses for RAG analysis
   * @param {number} userId - User ID
   * @param {object} structuredData - Parsed expense data
   * @param {object} options - Additional options for context retrieval
   * @returns {Promise<Array>} Array of contextual expenses
   */
  async getRAGContext(userId, structuredData, options = {}) {
    try {
      console.log('🔍 Building RAG context for user:', userId);
      
      const {
        maxContextSize = 100,
        includeAIExpenses = true,
        timeRangeMonths = 6,
        similarityThreshold = 0.7
      } = options;

      // Check cache first
      const cacheKey = this.generateCacheKey(userId, structuredData);
      if (this.contextCache.has(cacheKey)) {
        const cachedData = this.contextCache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheTimeout) {
          console.log('📋 Using cached RAG context');
          return cachedData.data;
        }
        this.contextCache.delete(cacheKey);
      }

      // Build context from multiple sources
      const context = await this.buildMultiSourceContext(
        userId, 
        structuredData, 
        { maxContextSize, includeAIExpenses, timeRangeMonths, similarityThreshold }
      );

      // Cache the result
      this.contextCache.set(cacheKey, {
        data: context,
        timestamp: Date.now()
      });

      console.log(`✅ Built RAG context: ${context.length} items`);
      return context;

    } catch (error) {
      console.error('❌ Error building RAG context:', error);
      return [];
    }
  }

  /**
   * Get AI-processed expenses for enhanced context
   */
  async getAIProcessedContext(userId, structuredData, cutoffDate, limit) {
    try {
      const categories = structuredData.categories || [];
      
      const aiExpenses = await AIExpense.find({
        userId: userId,
        $or: [
          { category: { $in: categories } },
          { aiCategory: { $in: categories } }
        ],
        createdAt: { $gte: cutoffDate },
        confidence: { $gte: 0.7 }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

      return aiExpenses.map(exp => ({
        ...exp,
        contextType: 'ai_processed',
        relevanceScore: exp.confidence
      }));

    } catch (error) {
      console.error('Error getting AI context:', error);
      return [];
    }
  }

  /**
   * Deduplicate and rank context items
   */
  deduplicateAndRank(contextItems, structuredData, maxSize) {
    // Remove duplicates based on description and amount
    const seen = new Set();
    const deduplicated = contextItems.filter(item => {
      const key = `${item.description}-${item.amount}-${item.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by relevance score
    deduplicated.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // Return top items
    return deduplicated.slice(0, maxSize);
  }

  /**
   * Calculate category relevance score
   */
  calculateCategoryRelevance(expenseCategory, targetCategories) {
    if (targetCategories.includes(expenseCategory)) return 1.0;
    
    // Category similarity mapping
    const categoryGroups = {
      'food': ['Food & Dining'],
      'transport': ['Transportation'],
      'bills': ['Bills & Utilities'],
      'shopping': ['Shopping'],
      'entertainment': ['Entertainment'],
      'health': ['Healthcare']
    };

    for (const [group, categories] of Object.entries(categoryGroups)) {
      if (categories.includes(expenseCategory)) {
        const overlap = categories.filter(cat => targetCategories.includes(cat));
        if (overlap.length > 0) return 0.7;
      }
    }

    return 0.1;
  }

  /**
   * Calculate amount relevance score
   */
  calculateAmountRelevance(expenseAmount, targetAverage) {
    const difference = Math.abs(expenseAmount - targetAverage);
    const percentDiff = difference / targetAverage;
    
    if (percentDiff <= 0.1) return 1.0;
    if (percentDiff <= 0.3) return 0.8;
    if (percentDiff <= 0.5) return 0.6;
    if (percentDiff <= 1.0) return 0.4;
    return 0.1;
  }

  /**
   * Calculate temporal relevance score
   */
  calculateTemporalRelevance(expenseDate) {
    const now = new Date();
    const daysDiff = (now - new Date(expenseDate)) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 7) return 1.0;
    if (daysDiff <= 30) return 0.8;
    if (daysDiff <= 90) return 0.6;
    if (daysDiff <= 180) return 0.4;
    return 0.2;
  }

  /**
   * Generate cache key for context
   */
  generateCacheKey(userId, structuredData) {
    const keyData = {
      userId,
      categories: (structuredData.categories || []).sort(),
      totalAmount: Math.floor((structuredData.totalAmount || 0) / 100) * 100, // Round to nearest $100
      expenseCount: structuredData.expenseCount || 0
    };
    
    return JSON.stringify(keyData);
  }

  /**
   * Get user spending patterns for enhanced context
   */
  async getUserSpendingPatterns(userId, months = 6) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const pipeline = [
        {
          $match: {
            userId: userId,
            date: { $gte: cutoffDate }
          }
        },
        {
          $group: {
            _id: {
              category: '$category',
              month: { $dateToString: { format: '%Y-%m', date: '$date' } }
            },
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        },
        {
          $group: {
            _id: '$_id.category',
            monthlyData: {
              $push: {
                month: '$_id.month',
                total: '$totalAmount',
                count: '$count',
                avg: '$avgAmount'
              }
            },
            overallTotal: { $sum: '$totalAmount' },
            overallCount: { $sum: '$count' },
            overallAvg: { $avg: '$avgAmount' }
          }
        },
        { $sort: { overallTotal: -1 } }
      ];

      const patterns = await Expense.aggregate(pipeline);
      
      console.log(`📊 Generated spending patterns for ${patterns.length} categories`);
      return patterns;

    } catch (error) {
      console.error('Error getting spending patterns:', error);
      return [];
    }
  }

  /**
   * Get merchant spending patterns
   */
  async getMerchantPatterns(userId, months = 3) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);

      const merchantData = await AIExpense.find({
        userId: userId,
        merchant: { $ne: null, $exists: true },
        createdAt: { $gte: cutoffDate }
      })
      .select('merchant amount category createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

      const merchantPatterns = {};
      merchantData.forEach(expense => {
        if (!merchantPatterns[expense.merchant]) {
          merchantPatterns[expense.merchant] = {
            totalSpent: 0,
            visitCount: 0,
            categories: new Set(),
            avgAmount: 0
          };
        }
        
        const pattern = merchantPatterns[expense.merchant];
        pattern.totalSpent += expense.amount;
        pattern.visitCount += 1;
        pattern.categories.add(expense.category);
        pattern.avgAmount = pattern.totalSpent / pattern.visitCount;
      });

      // Convert sets to arrays and sort by total spent
      const sortedPatterns = Object.entries(merchantPatterns)
        .map(([merchant, data]) => ({
          merchant,
          ...data,
          categories: Array.from(data.categories)
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent);

      console.log(`🏪 Generated merchant patterns for ${sortedPatterns.length} merchants`);
      return sortedPatterns.slice(0, 20); // Top 20 merchants

    } catch (error) {
      console.error('Error getting merchant patterns:', error);
      return [];
    }
  }

  /**
   * Build context from multiple data sources
   */
  async buildMultiSourceContext(userId, structuredData, options) {
    const categories = structuredData.categories || [];
    const totalAmount = structuredData.totalAmount || 0;
    const expenseAmounts = structuredData.monthlyExpenses?.map(e => e.amount) || [];
    
    // Calculate date range
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - options.timeRangeMonths);

    // 1. Category-based context
    const categoryContext = await this.getCategoryBasedContext(
      userId, 
      categories, 
      cutoffDate, 
      Math.floor(options.maxContextSize * 0.4)
    );

    // 2. Amount-based context
    const amountContext = await this.getAmountBasedContext(
      userId, 
      expenseAmounts, 
      cutoffDate, 
      Math.floor(options.maxContextSize * 0.3)
    );

    // 3. Temporal context (recent expenses)
    const temporalContext = await this.getTemporalContext(
      userId, 
      cutoffDate, 
      Math.floor(options.maxContextSize * 0.2)
    );

    // 4. AI-processed expenses context
    let aiContext = [];
    if (options.includeAIExpenses) {
      aiContext = await this.getAIProcessedContext(
        userId, 
        structuredData, 
        cutoffDate, 
        Math.floor(options.maxContextSize * 0.1)
      );
    }

    // Combine and deduplicate
    const allContext = [
      ...categoryContext,
      ...amountContext,
      ...temporalContext,
      ...aiContext
    ];

    return this.deduplicateAndRank(allContext, structuredData, options.maxContextSize);
  }

  /**
   * Get expenses from similar categories
   */
  async getCategoryBasedContext(userId, categories, cutoffDate, limit) {
    if (!categories.length) return [];

    try {
      const expenses = await Expense.find({
        userId: userId,
        category: { $in: categories },
        date: { $gte: cutoffDate }
      })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

      return expenses.map(exp => ({
        ...exp,
        contextType: 'category',
        relevanceScore: this.calculateCategoryRelevance(exp.category, categories)
      }));

    } catch (error) {
      console.error('Error getting category context:', error);
      return [];
    }
  }

  /**
   * Get expenses with similar amounts
   */
  async getAmountBasedContext(userId, amounts, cutoffDate, limit) {
    if (!amounts.length) return [];

    try {
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const minAmount = Math.min(...amounts) * 0.5;
      const maxAmount = Math.max(...amounts) * 2;

      const expenses = await Expense.find({
        userId: userId,
        amount: { $gte: minAmount, $lte: maxAmount },
        date: { $gte: cutoffDate }
      })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

      return expenses.map(exp => ({
        ...exp,
        contextType: 'amount',
        relevanceScore: this.calculateAmountRelevance(exp.amount, avgAmount)
      }));

    } catch (error) {
      console.error('Error getting amount context:', error);
      return [];
    }
  }

  /**
   * Get recent expenses for temporal context
   */
  async getTemporalContext(userId, cutoffDate, limit) {
    try {
      const expenses = await Expense.find({
        userId: userId,
        date: { $gte: cutoffDate }
      })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

      return expenses.map(exp => ({
        ...exp,
        contextType: 'temporal',
        relevanceScore: this.calculateTemporalRelevance(exp.date)
      }));

    } catch (error) {
      console.error('Error getting temporal context:', error);
      return [];
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.contextCache.clear();
    console.log('🧹 RAG context cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      size: this.contextCache.size,
      keys: Array.from(this.contextCache.keys()),
      oldestEntry: null,
      newestEntry: null
    };

    if (this.contextCache.size > 0) {
      const timestamps = Array.from(this.contextCache.values()).map(v => v.timestamp);
      stats.oldestEntry = new Date(Math.min(...timestamps));
      stats.newestEntry = new Date(Math.max(...timestamps));
    }

    return stats;
  }
}

module.exports = new RAGContextService();