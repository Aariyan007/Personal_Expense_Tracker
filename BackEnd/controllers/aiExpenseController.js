// controllers/ai.controller.js
const { validationResult } = require('express-validator');
const Expense = require('../models/ExpenseSchema'); // Your main expense model
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with error handling
let model;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
  } else {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" // Using the updated model name
    });
    console.log('✅ Gemini AI initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
}

// RAG-Enhanced Monthly Expense Analysis
exports.processMonthlyExpenseParagraph = async (req, res) => {
  try {
    console.log('=== RAG MONTHLY EXPENSE PROCESSING STARTED ===');
    console.log('User ID:', req.user?.userId || req.user?.id);
    console.log('Input Paragraph:', req.body.paragraph);
    console.log('Timestamp:', new Date().toISOString());

    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paragraph } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Check if Gemini AI is available
    if (!model) {
      console.log('⚠️  Gemini AI not available, using fallback processing');
      return handleFallbackProcessing(req, res, paragraph, userId);
    }

    // Step 1: Convert paragraph to structured JSON using Gemini
    console.log('🤖 Step 1: Converting paragraph to JSON using Gemini...');
    const structuredData = await convertParagraphToJSON(paragraph);
    
    // Step 2: Retrieve simple RAG context
    console.log('🔍 Step 2: Retrieving RAG context...');
    const ragContext = await retrieveSimpleRAGContext(userId, structuredData);
    
    // Step 3: Generate intelligent analysis using RAG + Gemini
    console.log('🧠 Step 3: Generating RAG-enhanced analysis...');
    const ragAnalysis = await generateRAGAnalysis(paragraph, structuredData, ragContext);
    
    // Step 4: Save the analysis for future RAG training
    console.log('💾 Step 4: Saving analysis for RAG training...');
    const saveResult = await saveRAGAnalysis(userId, paragraph, structuredData, ragAnalysis);

    console.log('✅ RAG processing completed successfully');
    console.log('=== RAG MONTHLY EXPENSE PROCESSING COMPLETED ===\n');

    res.json({
      success: true,
      originalParagraph: paragraph,
      structuredData: structuredData,
      ragContext: {
        totalSimilarExpenses: ragContext.length,
        categories: [...new Set(ragContext.map(e => e.category).filter(Boolean))],
        contextTypes: [...new Set(ragContext.map(e => e.contextType || 'regular'))],
      },
      analysis: ragAnalysis,
      saveResult: saveResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Critical Error in RAG processing:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing monthly expense paragraph',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Processing failed'
    });
  }
};

// Fallback processing when Gemini AI is not available
async function handleFallbackProcessing(req, res, paragraph, userId) {
  try {
    const structuredData = fallbackParagraphParser(paragraph);
    const ragContext = await retrieveSimpleRAGContext(userId, structuredData);
    const ragAnalysis = generateFallbackAnalysis(structuredData);
    const saveResult = await saveRAGAnalysis(userId, paragraph, structuredData, ragAnalysis);

    res.json({
      success: true,
      originalParagraph: paragraph,
      structuredData: structuredData,
      ragContext: {
        totalSimilarExpenses: ragContext.length,
        categories: [...new Set(ragContext.map(e => e.category).filter(Boolean))],
      },
      analysis: ragAnalysis,
      saveResult: saveResult,
      fallbackUsed: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
}

// Step 1: Convert paragraph to structured JSON
async function convertParagraphToJSON(paragraph) {
  try {
    const prompt = `
      You are an expert financial data analyst. Convert this monthly expense paragraph into a structured JSON format.
      
      Input paragraph: "${paragraph}"
      
      Extract ALL expenses mentioned and return a JSON object with this EXACT structure:
      {
        "monthlyExpenses": [
          {
            "description": "exact description from text",
            "amount": number,
            "category": "one of: Food & Dining, Transportation, Shopping, Bills & Utilities, Entertainment, Healthcare, Other",
            "frequency": "one of: daily, weekly, monthly, one-time",
            "merchant": "merchant name if mentioned or null",
            "paymentMethod": "Cash, Card, Digital, or Unknown",
            "confidence": number between 0.0 and 1.0
          }
        ],
        "totalAmount": total_sum_of_all_expenses,
        "expenseCount": number_of_expenses_found,
        "categories": ["unique", "categories", "found"],
        "timeframe": "detected timeframe (weekly, monthly, etc.)",
        "insights": [
          "key insight 1",
          "key insight 2"
        ]
      }
      
      Rules:
      - Extract EVERY expense mentioned, no matter how small
      - Be precise with amounts - extract exact numbers
      - Use the exact category names provided
      - Set confidence based on clarity of the expense information
      - Include insights about spending patterns
      - Return ONLY valid JSON, no explanations
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    console.log('🤖 Gemini JSON Conversion Result:', jsonText);
    
    // Clean and parse JSON
    const cleanedJson = jsonText.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);
    
    // Validate structure
    if (!parsedData.monthlyExpenses || !Array.isArray(parsedData.monthlyExpenses)) {
      throw new Error('Invalid JSON structure returned by Gemini');
    }
    
    console.log('✅ Successfully converted paragraph to JSON');
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error converting paragraph to JSON:', error);
    // Fallback to basic parsing if Gemini fails
    return fallbackParagraphParser(paragraph);
  }
}

// Fallback parser if Gemini fails
function fallbackParagraphParser(paragraph) {
  console.log('🔄 Using fallback parser...');
  
  // Simple regex to extract dollar amounts
  const amounts = [...paragraph.matchAll(/\$(\d+(?:\.\d{2})?)/g)];
  const expenses = [];
  
  // Common keywords for categorization
  const categoryKeywords = {
    'Food & Dining': ['food', 'grocery', 'groceries', 'restaurant', 'dining', 'eat', 'pizza', 'coffee', 'starbucks'],
    'Bills & Utilities': ['rent', 'electric', 'electricity', 'water', 'internet', 'phone', 'bill'],
    'Transportation': ['gas', 'fuel', 'transport', 'uber', 'lyft', 'car'],
    'Entertainment': ['movie', 'netflix', 'spotify', 'entertainment', 'friends'],
    'Healthcare': ['gym', 'medicine', 'health', 'doctor'],
    'Shopping': ['clothes', 'amazon', 'shopping', 'supplies']
  };
  
  // Extract context around each amount
  for (const match of amounts) {
    const amount = parseFloat(match[1]);
    const index = match.index;
    const contextStart = Math.max(0, index - 50);
    const contextEnd = Math.min(paragraph.length, index + 50);
    const context = paragraph.slice(contextStart, contextEnd).toLowerCase();
    
    // Determine category based on context
    let category = 'Other';
    let confidence = 0.6;
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => context.includes(keyword))) {
        category = cat;
        confidence = 0.8;
        break;
      }
    }
    
    expenses.push({
      description: `Expense of $${match[1]}`,
      amount: amount,
      category: category,
      frequency: 'monthly',
      merchant: null,
      paymentMethod: 'Unknown',
      confidence: confidence
    });
  }
  
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = [...new Set(expenses.map(e => e.category))];
  
  return {
    monthlyExpenses: expenses,
    totalAmount: totalAmount,
    expenseCount: expenses.length,
    categories: categories,
    timeframe: 'monthly',
    insights: [
      `Found ${expenses.length} expenses totaling $${totalAmount}`,
      'Fallback parser used - results may be less accurate'
    ]
  };
}

// Simplified RAG context retrieval
async function retrieveSimpleRAGContext(userId, structuredData) {
  try {
    const categories = structuredData.categories || [];
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Last 3 months
    
    // Get similar expenses from regular collection
    const similarExpenses = await Expense.find({
      userId: userId,
      $or: [
        { category: { $in: categories } },
        { date: { $gte: cutoffDate } }
      ]
    })
    .sort({ date: -1 })
    .limit(30)
    .lean();

    const allContext = similarExpenses.map(e => ({ ...e, contextType: 'regular' }));
    
    console.log(`🔍 Retrieved ${allContext.length} items for RAG context`);
    return allContext;
    
  } catch (error) {
    console.error('❌ Error retrieving RAG context:', error);
    return [];
  }
}

// Step 3: Generate RAG-enhanced analysis
async function generateRAGAnalysis(originalParagraph, structuredData, ragContext) {
  try {
    if (!model) {
      return generateFallbackAnalysis(structuredData);
    }

    const contextSummary = prepareContextSummary(ragContext);
    
    const prompt = `
      You are a personal finance advisor with access to the user's historical spending data. 
      Analyze their monthly expense paragraph and provide intelligent insights based on their past patterns.
      
      ORIGINAL USER INPUT:
      "${originalParagraph}"
      
      EXTRACTED STRUCTURED DATA:
      ${JSON.stringify(structuredData, null, 2)}
      
      HISTORICAL SPENDING CONTEXT (RAG DATA):
      ${contextSummary}
      
      Based on the user's historical spending patterns and current month's expenses, provide a JSON response with this structure:
      {
        "spendingAnalysis": {
          "monthlyComparison": "detailed comparison text",
          "categoryTrends": ["trend1", "trend2"],
          "anomalies": ["anomaly1", "anomaly2"],
          "totalSpentComparison": "comparison with historical average"
        },
        "personalizedInsights": {
          "budgetRecommendations": ["rec1", "rec2"],
          "categoryAdvice": {
            "category1": "advice",
            "category2": "advice"
          },
          "savingsOpportunities": ["opp1", "opp2"]
        },
        "predictions": {
          "nextMonthExpected": number,
          "upcomingExpenses": ["expense1", "expense2"],
          "budgetAdjustments": ["adj1", "adj2"]
        },
        "financialHealthScore": {
          "score": number_1_to_10,
          "strengths": ["strength1", "strength2"],
          "improvements": ["improvement1", "improvement2"],
          "summary": "overall summary text"
        },
        "actionableSteps": ["step1", "step2", "step3"]
      }
      
      Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log('🧠 RAG Analysis Raw Response:', analysisText);
    
    const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedResponse);
    
    console.log('✅ RAG Analysis Generated Successfully');
    return analysis;
    
  } catch (error) {
    console.error('❌ Error generating RAG analysis:', error);
    return generateFallbackAnalysis(structuredData);
  }
}

// Prepare context summary for RAG
function prepareContextSummary(ragContext) {
  if (ragContext.length === 0) return "No historical data available.";
  
  const categoryStats = {};
  let totalHistoricalSpending = 0;
  
  ragContext.forEach(expense => {
    const category = expense.category || 'Other';
    if (!categoryStats[category]) {
      categoryStats[category] = { total: 0, count: 0, avgAmount: 0 };
    }
    categoryStats[category].total += expense.amount || 0;
    categoryStats[category].count += 1;
    totalHistoricalSpending += expense.amount || 0;
  });
  
  // Calculate averages
  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].avgAmount = categoryStats[category].total / categoryStats[category].count;
  });
  
  return `
    HISTORICAL SPENDING SUMMARY:
    - Total historical entries: ${ragContext.length}
    - Total historical spending: $${totalHistoricalSpending.toFixed(2)}
    - Average spending per transaction: $${(totalHistoricalSpending / ragContext.length).toFixed(2)}
    
    CATEGORY BREAKDOWN:
    ${Object.entries(categoryStats).map(([category, stats]) => 
      `- ${category}: ${stats.count} transactions, $${stats.total.toFixed(2)} total, $${stats.avgAmount.toFixed(2)} average`
    ).join('\n    ')}
  `;
}

// Fallback analysis if RAG fails
function generateFallbackAnalysis(structuredData) {
  return {
    spendingAnalysis: {
      monthlyComparison: "Analysis based on current month data only",
      categoryTrends: [`You spent $${structuredData.totalAmount} across ${structuredData.categories.length} categories`],
      anomalies: [],
      totalSpentComparison: `Total monthly expenses: $${structuredData.totalAmount}`
    },
    personalizedInsights: {
      budgetRecommendations: ["Track your expenses regularly", "Set category-wise budgets"],
      categoryAdvice: {},
      savingsOpportunities: ["Review recurring expenses", "Look for unnecessary subscriptions"]
    },
    predictions: {
      nextMonthExpected: structuredData.totalAmount * 1.05,
      upcomingExpenses: ["Similar monthly expenses expected"],
      budgetAdjustments: ["Monitor spending closely"]
    },
    financialHealthScore: {
      score: 7,
      strengths: ["Good expense tracking"],
      improvements: ["Need more historical data for better analysis"],
      summary: "Keep tracking expenses for better insights"
    },
    actionableSteps: [
      "Continue logging expenses",
      "Set monthly budgets",
      "Review spending weekly"
    ]
  };
}

// Step 4: Save RAG analysis for future training
async function saveRAGAnalysis(userId, paragraph, structuredData, analysis) {
  try {
    // Save each expense from structured data
    const savedExpenses = [];
    
    for (const expense of structuredData.monthlyExpenses) {
      const expenseRecord = new Expense({
        userId: userId,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        type: 'expense',
        date: new Date(),
        // AI Processing Fields
        originalText: paragraph,
        merchant: expense.merchant,
        paymentMethod: expense.paymentMethod,
        confidence: expense.confidence,
        aiProcessed: true,
        suggestions: analysis.actionableSteps || [],
        // Additional AI fields
        aiCategory: expense.category,
        aiAmount: expense.amount,
        aiDescription: expense.description,
        processingStatus: 'completed',
        lastProcessedAt: new Date()
      });
      
      await expenseRecord.save();
      savedExpenses.push(expenseRecord);
    }
    
    console.log(`💾 Saved ${savedExpenses.length} expenses`);
    console.log(`📊 Total amount processed: $${structuredData.totalAmount}`);
    
    return {
      savedExpenses: savedExpenses.length,
      totalAmount: structuredData.totalAmount
    };
    
  } catch (error) {
    console.error('❌ Error saving RAG analysis:', error);
    throw error;
  }
}

// Other required functions for compatibility
exports.processExpenseText = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

exports.saveProcessedExpense = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

exports.getAIInsights = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

exports.getAIExpenses = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

exports.exportExpensesForRAG = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};

exports.exportRAGTrainingData = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Function not implemented yet'
  });
};