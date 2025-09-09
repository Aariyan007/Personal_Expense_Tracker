// const { validationResult } = require('express-validator');
// const Expense = require('../models/ExpenseSchema');
// const AIExpense = require('../models/aiExpense.model');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const RAGContextService = require('../services/ragContext.service');

// // Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// // RAG-Enhanced Monthly Expense Analysis
// exports.processMonthlyExpenseParagraph = async (req, res) => {
//   try {
//     console.log('=== RAG MONTHLY EXPENSE PROCESSING STARTED ===');
//     console.log('User ID:', req.user.userId);
//     console.log('Input Paragraph:', req.body.paragraph);
//     console.log('Timestamp:', new Date().toISOString());

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Validation Errors:', errors.array());
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const { paragraph } = req.body;
//     const userId = req.user.userId;

//     // Step 1: Convert paragraph to structured JSON using Gemini
//     console.log('🤖 Step 1: Converting paragraph to JSON using Gemini...');
//     const structuredData = await convertParagraphToJSON(paragraph);
    
//     // Step 2: Retrieve RAG context using the enhanced service
//     console.log('🔍 Step 2: Retrieving enhanced RAG context...');
//     const ragContext = await RAGContextService.getRAGContext(userId, structuredData, {
//       maxContextSize: 100,
//       includeAIExpenses: true,
//       timeRangeMonths: 6,
//       similarityThreshold: 0.7
//     });

//     // Step 2.5: Get additional user patterns for better context
//     const spendingPatterns = await RAGContextService.getUserSpendingPatterns(userId, 6);
//     const merchantPatterns = await RAGContextService.getMerchantPatterns(userId, 3);
    
//     // Step 3: Generate intelligent analysis using enhanced RAG + Gemini
//     console.log('🧠 Step 3: Generating RAG-enhanced analysis...');
//     const ragAnalysis = await generateRAGAnalysis(
//       paragraph, 
//       structuredData, 
//       ragContext, 
//       spendingPatterns, 
//       merchantPatterns
//     );
    
//     // Step 4: Save the analysis for future RAG training
//     console.log('💾 Step 4: Saving analysis for RAG training...');
//     await saveRAGAnalysis(userId, paragraph, structuredData, ragAnalysis);

//     console.log('✅ RAG processing completed successfully');
//     console.log('=== RAG MONTHLY EXPENSE PROCESSING COMPLETED ===\n');

//     res.json({
//       success: true,
//       originalParagraph: paragraph,
//       structuredData: structuredData,
//       ragContext: {
//         totalSimilarExpenses: ragContext.length,
//         categories: [...new Set(ragContext.map(e => e.category || e.aiCategory).filter(Boolean))],
//         contextTypes: [...new Set(ragContext.map(e => e.contextType))],
//         spendingPatterns: spendingPatterns.length,
//         merchantPatterns: merchantPatterns.length
//       },
//       analysis: ragAnalysis,
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     console.error('💥 Critical Error in RAG processing:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error processing monthly expense paragraph',
//       error: error.message
//     });
//   }
// };

// // Step 1: Convert paragraph to structured JSON
// async function convertParagraphToJSON(paragraph) {
//   try {
//     const prompt = `
//       You are an expert financial data analyst. Convert this monthly expense paragraph into a structured JSON format.
      
//       Input paragraph: "${paragraph}"
      
//       Extract ALL expenses mentioned and return a JSON object with this EXACT structure:
//       {
//         "monthlyExpenses": [
//           {
//             "description": "exact description from text",
//             "amount": number,
//             "category": "one of: Food & Dining, Transportation, Shopping, Bills & Utilities, Entertainment, Healthcare, Other",
//             "frequency": "one of: daily, weekly, monthly, one-time",
//             "merchant": "merchant name if mentioned or null",
//             "paymentMethod": "Cash, Card, Digital, or Unknown",
//             "confidence": number between 0.0 and 1.0
//           }
//         ],
//         "totalAmount": total_sum_of_all_expenses,
//         "expenseCount": number_of_expenses_found,
//         "categories": ["unique", "categories", "found"],
//         "timeframe": "detected timeframe (weekly, monthly, etc.)",
//         "insights": [
//           "key insight 1",
//           "key insight 2"
//         ]
//       }
      
//       Rules:
//       - Extract EVERY expense mentioned, no matter how small
//       - Be precise with amounts - extract exact numbers
//       - Use the exact category names provided
//       - Set confidence based on clarity of the expense information
//       - Include insights about spending patterns
//       - Return ONLY valid JSON, no explanations
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const jsonText = response.text();
    
//     console.log('🤖 Gemini JSON Conversion Result:', jsonText);
    
//     // Clean and parse JSON
//     const cleanedJson = jsonText.replace(/```json\n?|\n?```/g, '').trim();
//     const parsedData = JSON.parse(cleanedJson);
    
//     // Validate structure
//     if (!parsedData.monthlyExpenses || !Array.isArray(parsedData.monthlyExpenses)) {
//       throw new Error('Invalid JSON structure returned by Gemini');
//     }
    
//     console.log('✅ Successfully converted paragraph to JSON:', parsedData);
//     return parsedData;
    
//   } catch (error) {
//     console.error('❌ Error converting paragraph to JSON:', error);
//     // Fallback to basic parsing if Gemini fails
//     return fallbackParagraphParser(paragraph);
//   }
// }

// // Fallback parser if Gemini fails
// function fallbackParagraphParser(paragraph) {
//   const amounts = [...paragraph.matchAll(/\$(\d+(?:\.\d{2})?)/g)];
//   const expenses = [];
  
//   for (const match of amounts) {
//     expenses.push({
//       description: `Expense of $${match[1]}`,
//       amount: parseFloat(match[1]),
//       category: 'Other',
//       frequency: 'one-time',
//       merchant: null,
//       paymentMethod: 'Unknown',
//       confidence: 0.6
//     });
//   }
  
//   return {
//     monthlyExpenses: expenses,
//     totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
//     expenseCount: expenses.length,
//     categories: ['Other'],
//     timeframe: 'monthly',
//     insights: ['Expenses detected but need more detailed analysis']
//   };
// }

// // Step 2: Retrieve RAG context from similar expenses
// async function retrieveRAGContext(userId, structuredData) {
//   try {
//     const categories = structuredData.categories;
//     const amounts = structuredData.monthlyExpenses.map(e => e.amount);
//     const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    
//     // Build RAG query to find similar expenses
//     const ragQuery = {
//       userId: userId,
//       $or: [
//         // Similar categories
//         { category: { $in: categories } },
//         // Similar amounts (±50% range)
//         { amount: { $gte: avgAmount * 0.5, $lte: avgAmount * 1.5 } },
//         // Recent expenses
//         { date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
//       ]
//     };
    
//     // Get regular expenses
//     const similarExpenses = await Expense.find(ragQuery)
//       .sort({ date: -1 })
//       .limit(50)
//       .lean();
      
//     // Get AI processed expenses with more context
//     const aiExpenses = await AIExpense.find({
//       userId: userId,
//       $or: [
//         { category: { $in: categories } },
//         { aiCategory: { $in: categories } }
//       ]
//     })
//     .sort({ createdAt: -1 })
//     .limit(25)
//     .lean();
    
//     // Combine and deduplicate
//     const allContext = [...similarExpenses, ...aiExpenses];
    
//     console.log(`🔍 Retrieved ${allContext.length} similar expenses for RAG context`);
//     console.log(`Categories: ${categories.join(', ')}`);
//     console.log(`Average amount: $${avgAmount.toFixed(2)}`);
    
//     return allContext;
    
//   } catch (error) {
//     console.error('❌ Error retrieving RAG context:', error);
//     return [];
//   }
// }

// // Step 3: Generate RAG-enhanced analysis
// async function generateRAGAnalysis(originalParagraph, structuredData, ragContext) {
//   try {
//     // Prepare RAG context for Gemini
//     const contextSummary = prepareContextSummary(ragContext);
    
//     const prompt = `
//       You are a personal finance advisor with access to the user's historical spending data. 
//       Analyze their monthly expense paragraph and provide intelligent insights based on their past patterns.
      
//       ORIGINAL USER INPUT:
//       "${originalParagraph}"
      
//       EXTRACTED STRUCTURED DATA:
//       ${JSON.stringify(structuredData, null, 2)}
      
//       HISTORICAL SPENDING CONTEXT (RAG DATA):
//       ${contextSummary}
      
//       Based on the user's historical spending patterns and current month's expenses, provide:
      
//       1. SPENDING ANALYSIS:
//          - How does this month compare to their typical patterns?
//          - Which categories show unusual increases/decreases?
//          - Are there any spending anomalies?
      
//       2. PERSONALIZED INSIGHTS:
//          - Budget recommendations based on their history
//          - Category-specific advice
//          - Savings opportunities
      
//       3. PREDICTIVE SUGGESTIONS:
//          - Expected future expenses based on patterns
//          - Recommendations for next month
//          - Budget adjustments
      
//       4. FINANCIAL HEALTH SCORE:
//          - Rate their financial discipline (1-10)
//          - Key strengths and areas for improvement
      
//       Return a JSON response with this structure:
//       {
//         "spendingAnalysis": {
//           "monthlyComparison": "detailed comparison text",
//           "categoryTrends": ["trend1", "trend2"],
//           "anomalies": ["anomaly1", "anomaly2"],
//           "totalSpentComparison": "comparison with historical average"
//         },
//         "personalizedInsights": {
//           "budgetRecommendations": ["rec1", "rec2"],
//           "categoryAdvice": {
//             "category1": "advice",
//             "category2": "advice"
//           },
//           "savingsOpportunities": ["opp1", "opp2"]
//         },
//         "predictions": {
//           "nextMonthExpected": number,
//           "upcomingExpenses": ["expense1", "expense2"],
//           "budgetAdjustments": ["adj1", "adj2"]
//         },
//         "financialHealthScore": {
//           "score": number_1_to_10,
//           "strengths": ["strength1", "strength2"],
//           "improvements": ["improvement1", "improvement2"],
//           "summary": "overall summary text"
//         },
//         "actionableSteps": ["step1", "step2", "step3"]
//       }
      
//       Make your analysis personal, actionable, and based on the actual data patterns you see.
//       Return ONLY valid JSON.
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const analysisText = response.text();
    
//     console.log('🧠 RAG Analysis Raw Response:', analysisText);
    
//     const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, '').trim();
//     const analysis = JSON.parse(cleanedResponse);
    
//     console.log('✅ RAG Analysis Generated Successfully');
//     return analysis;
    
//   } catch (error) {
//     console.error('❌ Error generating RAG analysis:', error);
//     return generateFallbackAnalysis(structuredData);
//   }
// }

// // Prepare context summary for RAG
// function prepareContextSummary(ragContext) {
//   if (ragContext.length === 0) return "No historical data available.";
  
//   const categoryStats = {};
//   let totalHistoricalSpending = 0;
  
//   ragContext.forEach(expense => {
//     const category = expense.category || expense.aiCategory || 'Other';
//     if (!categoryStats[category]) {
//       categoryStats[category] = { total: 0, count: 0, avgAmount: 0 };
//     }
//     categoryStats[category].total += expense.amount || 0;
//     categoryStats[category].count += 1;
//     totalHistoricalSpending += expense.amount || 0;
//   });
  
//   // Calculate averages
//   Object.keys(categoryStats).forEach(category => {
//     categoryStats[category].avgAmount = categoryStats[category].total / categoryStats[category].count;
//   });
  
//   return `
//     HISTORICAL SPENDING SUMMARY:
//     - Total historical entries: ${ragContext.length}
//     - Total historical spending: $${totalHistoricalSpending.toFixed(2)}
//     - Average spending per transaction: $${(totalHistoricalSpending / ragContext.length).toFixed(2)}
    
//     CATEGORY BREAKDOWN:
//     ${Object.entries(categoryStats).map(([category, stats]) => 
//       `- ${category}: ${stats.count} transactions, $${stats.total.toFixed(2)} total, $${stats.avgAmount.toFixed(2)} average`
//     ).join('\n    ')}
    
//     RECENT PATTERNS:
//     - Most frequent category: ${Object.entries(categoryStats).sort((a,b) => b[1].count - a[1].count)[0]?.[0] || 'None'}
//     - Highest spending category: ${Object.entries(categoryStats).sort((a,b) => b[1].total - a[1].total)[0]?.[0] || 'None'}
//   `;
// }

// // Fallback analysis if RAG fails
// function generateFallbackAnalysis(structuredData) {
//   return {
//     spendingAnalysis: {
//       monthlyComparison: "Analysis based on current month data only",
//       categoryTrends: [`You spent $${structuredData.totalAmount} across ${structuredData.categories.length} categories`],
//       anomalies: [],
//       totalSpentComparison: `Total monthly expenses: $${structuredData.totalAmount}`
//     },
//     personalizedInsights: {
//       budgetRecommendations: ["Track your expenses regularly", "Set category-wise budgets"],
//       categoryAdvice: {},
//       savingsOpportunities: ["Review recurring expenses", "Look for unnecessary subscriptions"]
//     },
//     predictions: {
//       nextMonthExpected: structuredData.totalAmount * 1.05,
//       upcomingExpenses: ["Similar monthly expenses expected"],
//       budgetAdjustments: ["Monitor spending closely"]
//     },
//     financialHealthScore: {
//       score: 7,
//       strengths: ["Good expense tracking"],
//       improvements: ["Need more historical data for better analysis"],
//       summary: "Keep tracking expenses for better insights"
//     },
//     actionableSteps: [
//       "Continue logging expenses",
//       "Set monthly budgets",
//       "Review spending weekly"
//     ]
//   };
// }

// // Step 4: Save RAG analysis for future training
// async function saveRAGAnalysis(userId, paragraph, structuredData, analysis) {
//   try {
//     // Save each expense from structured data
//     const savedExpenses = [];
    
//     for (const expense of structuredData.monthlyExpenses) {
//       const expenseRecord = new Expense({
//         userId: userId,
//         amount: expense.amount,
//         category: expense.category,
//         description: expense.description,
//         type: 'expense',
//         date: new Date()
//       });
      
//       await expenseRecord.save();
//       savedExpenses.push(expenseRecord);
//     }
    
//     // Save AI analysis for RAG training
//     const aiRecord = new AIExpense({
//       userId: userId,
//       amount: structuredData.totalAmount,
//       category: 'Multiple', // Since it's a monthly summary
//       description: `Monthly expense summary: ${structuredData.expenseCount} expenses`,
//       date: new Date(),
//       type: 'expense',
//       originalText: paragraph,
//       confidence: 0.95,
//       aiProcessed: true,
//       suggestions: analysis.actionableSteps || [],
//       aiCategory: 'Monthly Analysis',
//       aiAmount: structuredData.totalAmount,
//       aiDescription: paragraph,
//       processingStatus: 'completed',
//       lastProcessedAt: new Date(),
//       // Store additional RAG data
//       tags: ['monthly_summary', 'rag_processed', ...structuredData.categories.map(c => c.toLowerCase().replace(/\s+/g, '_'))],
//       paymentMethod: 'Multiple'
//     });
    
//     await aiRecord.save();
    
//     console.log(`💾 Saved ${savedExpenses.length} expenses and 1 AI analysis record`);
//     console.log(`📊 Total amount processed: $${structuredData.totalAmount}`);
    
//     return {
//       savedExpenses: savedExpenses.length,
//       totalAmount: structuredData.totalAmount,
//       aiRecordId: aiRecord._id
//     };
    
//   } catch (error) {
//     console.error('❌ Error saving RAG analysis:', error);
//     throw error;
//   }
// }

// // Export historical data for RAG training
// exports.exportRAGTrainingData = async (req, res) => {
//   try {
//     console.log('=== EXPORTING RAG TRAINING DATA ===');
//     const userId = req.user.userId;
    
//     // Get all expenses and AI data
//     const expenses = await Expense.find({ userId }).sort({ date: -1 }).lean();
//     const aiExpenses = await AIExpense.find({ userId }).sort({ createdAt: -1 }).lean();
    
//     // Format for RAG training
//     const ragTrainingData = {
//       metadata: {
//         userId: userId,
//         exportDate: new Date().toISOString(),
//         totalExpenses: expenses.length,
//         totalAIRecords: aiExpenses.length,
//         dateRange: {
//           earliest: expenses.length > 0 ? expenses[expenses.length - 1].date : null,
//           latest: expenses.length > 0 ? expenses[0].date : null
//         }
//       },
//       // Training pairs for RAG
//       trainingPairs: aiExpenses
//         .filter(ai => ai.originalText)
//         .map(ai => ({
//           input: ai.originalText,
//           context: findRelatedExpenses(expenses, ai),
//           output: {
//             structuredData: extractStructuredData(ai),
//             analysis: extractAnalysisData(ai)
//           },
//           metadata: {
//             confidence: ai.confidence,
//             processingDate: ai.createdAt,
//             categories: ai.tags || []
//           }
//         })),
//       // Category patterns for context
//       categoryPatterns: generateCategoryPatterns(expenses),
//       // Spending patterns
//       spendingPatterns: generateSpendingPatterns(expenses)
//     };
    
//     console.log(`📊 Exported ${ragTrainingData.trainingPairs.length} training pairs`);
//     console.log('=== RAG EXPORT COMPLETED ===\n');
    
//     res.json({
//       success: true,
//       data: ragTrainingData,
//       summary: {
//         trainingPairs: ragTrainingData.trainingPairs.length,
//         expenses: expenses.length,
//         aiRecords: aiExpenses.length
//       }
//     });
    
//   } catch (error) {
//     console.error('❌ Error exporting RAG data:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error exporting RAG training data',
//       error: error.message
//     });
//   }
// };

// // Helper functions for RAG export
// function findRelatedExpenses(expenses, aiExpense) {
//   return expenses
//     .filter(exp => 
//       exp.category === aiExpense.category || 
//       exp.category === aiExpense.aiCategory ||
//       Math.abs(exp.amount - (aiExpense.aiAmount || 0)) < 50
//     )
//     .slice(0, 10); // Limit context size
// }

// function extractStructuredData(aiExpense) {
//   return {
//     amount: aiExpense.aiAmount || aiExpense.amount,
//     category: aiExpense.aiCategory || aiExpense.category,
//     description: aiExpense.aiDescription || aiExpense.description,
//     confidence: aiExpense.confidence,
//     tags: aiExpense.tags
//   };
// }

// function extractAnalysisData(aiExpense) {
//   return {
//     suggestions: aiExpense.suggestions || [],
//     processingStatus: aiExpense.processingStatus,
//     confidence: aiExpense.confidence
//   };
// }

// function generateCategoryPatterns(expenses) {
//   const patterns = {};
//   expenses.forEach(exp => {
//     if (!patterns[exp.category]) {
//       patterns[exp.category] = {
//         count: 0,
//         totalAmount: 0,
//         avgAmount: 0,
//         commonMerchants: [],
//         timePatterns: []
//       };
//     }
//     patterns[exp.category].count++;
//     patterns[exp.category].totalAmount += exp.amount;
//   });
  
//   // Calculate averages
//   Object.keys(patterns).forEach(category => {
//     patterns[category].avgAmount = patterns[category].totalAmount / patterns[category].count;
//   });
  
//   return patterns;
// }

// function generateSpendingPatterns(expenses) {
//   const monthlySpending = {};
//   expenses.forEach(exp => {
//     const month = exp.date.toISOString().substring(0, 7); // YYYY-MM
//     if (!monthlySpending[month]) monthlySpending[month] = 0;
//     monthlySpending[month] += exp.amount;
//   });
  
//   return {
//     monthlyTotals: monthlySpending,
//     averageMonthly: Object.values(monthlySpending).reduce((sum, val) => sum + val, 0) / Object.keys(monthlySpending).length || 0,
//     trend: calculateTrend(Object.values(monthlySpending))
//   };
// }

// function calculateTrend(values) {
//   if (values.length < 2) return 'insufficient_data';
//   const recent = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
//   const older = values.slice(0, -3).reduce((sum, val) => sum + val, 0) / (values.length - 3);
//   return recent > older * 1.1 ? 'increasing' : recent < older * 0.9 ? 'decreasing' : 'stable';
// }