const mongoose = require('mongoose');
const Expense = require('../models/ExpenseSchema');
const AIExpense = require('../models/aiExpense.model');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample expense data for a full month
const sampleExpenseTexts = [
  // Food & Dining
  "I spent $25.50 on groceries at Target today",
  "Had coffee with Sarah for $8.75 at Starbucks this morning",
  "Lunch at McDonald's cost me $12.99",
  "Bought dinner ingredients at Whole Foods for $45.20",
  "Pizza delivery from Domino's was $18.50",
  "Breakfast at IHOP with family $67.30",
  "Grabbed a smoothie at Jamba Juice for $7.95",
  "Date night dinner at Olive Garden $89.45",
  "Quick snack at 7-Eleven $4.25",
  "Farmers market produce shopping $32.10",
  "Thai food takeout $24.75",
  "Ice cream at Baskin Robbins $9.80",
  "Brunch at local cafe $28.50",
  "Energy drinks and snacks $15.60",
  "Cooking class ingredients $55.00",

  // Transportation
  "Filled up gas tank at Shell for $52.30",
  "Uber ride to downtown cost $18.75",
  "Monthly subway pass $95.00",
  "Parking at the mall $8.00",
  "Oil change at Jiffy Lube $45.99",
  "Taxi from airport $35.50",
  "Bus ticket to visit mom $22.00",
  "Car wash at automatic wash $12.00",
  "Lyft to friend's house $14.25",
  "Gas at Chevron station $48.90",
  "Parking meter downtown $6.50",
  "Train ticket for weekend trip $85.00",

  // Shopping
  "New shirt from Amazon delivered $29.99",
  "Bought shoes at Nike store for $120.00",
  "Office supplies at Staples $34.50",
  "Birthday gift shopping at Target $75.25",
  "Phone case from Best Buy $25.99",
  "Books from Barnes & Noble $42.80",
  "Household items at Walmart $56.75",
  "Skincare products online $89.00",
  "Sports equipment at Dick's $145.50",
  "Art supplies for hobby $38.25",
  "Clothes shopping spree $189.99",
  "Electronics cable $19.95",

  // Bills & Utilities
  "Electric bill payment $127.45",
  "Internet bill monthly $79.99",
  "Phone bill paid online $85.00",
  "Water utility bill $45.30",
  "Cable TV subscription $89.99",
  "Home insurance payment $156.00",
  "Streaming service Netflix $15.99",
  "Spotify premium $9.99",

  // Entertainment
  "Movie tickets for two $28.00",
  "Concert tickets purchased $150.00",
  "Bowling with friends $35.75",
  "Video game purchase $59.99",
  "Mini golf date $24.50",
  "Museum admission $18.00",
  "Streaming movie rental $5.99",
  "Board game from store $45.99",
  "Escape room experience $32.00",
  "Comedy show tickets $65.00",

  // Healthcare
  "Pharmacy prescription pickup $25.60",
  "Doctor visit copay $40.00",
  "Vitamins from CVS $28.75",
  "Dental cleaning $150.00",
  "Eye exam copay $30.00",
  "Physical therapy session $75.00",
  "Flu shot at clinic $35.00",

  // Other
  "Haircut at salon $45.00",
  "Pet food and supplies $67.50",
  "Gym membership monthly $39.99",
  "Charity donation $50.00",
  "Gift card purchase $100.00",
  "Bank ATM fee $3.50",
  "Post office shipping $12.75",
  "Dry cleaning pickup $28.00",
  "Car registration fee $65.00",
  "Magazine subscription $24.99",
];

// Generate realistic amounts and categories
function processExpenseText(text) {
  const amounts = [...text.matchAll(/\$(\d+(?:\.\d{2})?)/g)];
  const amount = amounts.length > 0 ? parseFloat(amounts[0][1]) : Math.random() * 100 + 10;
  
  let category = 'Other';
  if (/grocery|groceries|food|restaurant|lunch|dinner|coffee|eating|pizza|breakfast|smoothie|snack|thai|ice cream|brunch/i.test(text)) {
    category = 'Food & Dining';
  } else if (/gas|fuel|uber|taxi|transport|car|parking|subway|bus|lyft|train/i.test(text)) {
    category = 'Transportation';
  } else if (/amazon|shopping|shirt|shoes|supplies|gift|phone|books|household|skincare|sports|clothes|electronics/i.test(text)) {
    category = 'Shopping';
  } else if (/bill|electric|internet|phone|water|cable|insurance|netflix|spotify/i.test(text)) {
    category = 'Bills & Utilities';
  } else if (/movie|concert|bowling|game|golf|museum|streaming|board|escape|comedy/i.test(text)) {
    category = 'Entertainment';
  } else if (/pharmacy|doctor|vitamins|dental|eye|therapy|flu|clinic/i.test(text)) {
    category = 'Healthcare';
  }
  
  return {
    isExpense: true,
    amount: amount,
    category: category,
    description: text,
    merchant: extractMerchant(text),
    location: extractLocation(text),
    confidence: 0.85 + Math.random() * 0.15, // 0.85 to 1.0
    tags: generateTags(text, category),
    paymentMethod: Math.random() > 0.7 ? 'Cash' : Math.random() > 0.5 ? 'Card' : 'Digital',
    suggestions: generateSuggestions(category)
  };
}

function extractMerchant(text) {
  const merchants = ['target', 'starbucks', 'mcdonalds', 'whole foods', 'dominos', 'ihop', 'jamba juice', 'olive garden', '7-eleven', 'shell', 'jiffy lube', 'amazon', 'nike', 'staples', 'best buy', 'barnes & noble', 'walmart', "dick's", 'netflix', 'spotify', 'cvs'];
  const found = merchants.find(merchant => text.toLowerCase().includes(merchant));
  return found ? found.charAt(0).toUpperCase() + found.slice(1) : null;
}

function extractLocation(text) {
  const locations = ['downtown', 'mall', 'airport', 'store', 'online', 'clinic', 'salon', 'station'];
  const found = locations.find(location => text.toLowerCase().includes(location));
  return found || null;
}

function generateTags(text, category) {
  const tags = [category.toLowerCase().replace(/\s+/g, '_')];
  if (/lunch|dinner|breakfast/i.test(text)) tags.push('meal');
  if (/online|delivered/i.test(text)) tags.push('online');
  if (/monthly|subscription/i.test(text)) tags.push('recurring');
  if (/family|friends|date/i.test(text)) tags.push('social');
  return tags;
}

function generateSuggestions(category) {
  const suggestions = {
    'Food & Dining': ['Consider meal prepping', 'Look for restaurant deals', 'Track food budget monthly'],
    'Transportation': ['Consider public transport', 'Track fuel efficiency', 'Combine trips to save'],
    'Shopping': ['Wait 24hrs before purchase', 'Compare prices online', 'Set monthly shopping limit'],
    'Bills & Utilities': ['Set up autopay', 'Review usage regularly', 'Look for better rates'],
    'Entertainment': ['Look for group discounts', 'Check for student rates', 'Consider streaming bundles'],
    'Healthcare': ['Use HSA if available', 'Compare pharmacy prices', 'Schedule preventive care']
  };
  return suggestions[category] || ['Track this expense category', 'Set monthly budget limits'];
}

// Generate random dates over the past month
function getRandomDateInLastMonth() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime());
  return new Date(randomTime);
}

// Main function to generate and save sample data
async function generateSampleData(userId = 12345) {
  try {
    console.log('🎯 Starting sample data generation...');
    console.log(`📊 Generating data for User ID: ${userId}`);
    
    // Clear existing data for this user (optional)
    const clearExisting = false; // Set to true if you want to clear existing data
    if (clearExisting) {
      await Expense.deleteMany({ userId });
      await AIExpense.deleteMany({ userId });
      console.log('🗑️ Cleared existing data');
    }
    
    const expenses = [];
    const aiExpenses = [];
    
    // Generate expense entries
    for (let i = 0; i < sampleExpenseTexts.length; i++) {
      const text = sampleExpenseTexts[i];
      const processedData = processExpenseText(text);
      const randomDate = getRandomDateInLastMonth();
      
      // Create regular expense entry
      const expense = new Expense({
        userId: userId,
        amount: processedData.amount,
        category: processedData.category,
        description: processedData.description,
        date: randomDate,
        type: 'expense'
      });
      
      expenses.push(expense);
      
      // Create AI expense entry for RAG training
      const aiExpense = new AIExpense({
        userId: userId,
        amount: processedData.amount,
        category: processedData.category,
        description: processedData.description,
        date: randomDate,
        type: 'expense',
        originalText: text,
        merchant: processedData.merchant,
        location: processedData.location,
        paymentMethod: processedData.paymentMethod,
        tags: processedData.tags,
        confidence: processedData.confidence,
        aiProcessed: true,
        suggestions: processedData.suggestions,
        aiCategory: processedData.category,
        aiAmount: processedData.amount,
        aiDescription: processedData.description,
        processingStatus: 'completed',
        lastProcessedAt: randomDate
      });
      
      aiExpenses.push(aiExpense);
    }
    
    // Add some additional random expenses to reach ~100 total for the month
    const additionalExpenses = [
      "Coffee run $4.50", "Parking fee $6.00", "Snack from vending machine $2.25",
      "Bus fare $3.50", "Lunch special $9.99", "Car wash $10.00",
      "Magazine purchase $5.95", "Candy bar $1.50", "Energy drink $3.25",
      "Phone charger $15.99", "Notebook $3.75", "Pen set $8.50"
    ];
    
    for (const text of additionalExpenses) {
      const processedData = processExpenseText(text);
      const randomDate = getRandomDateInLastMonth();
      
      const expense = new Expense({
        userId: userId,
        amount: processedData.amount,
        category: processedData.category,
        description: processedData.description,
        date: randomDate,
        type: 'expense'
      });
      
      expenses.push(expense);
      
      const aiExpense = new AIExpense({
        userId: userId,
        amount: processedData.amount,
        category: processedData.category,
        description: processedData.description,
        date: randomDate,
        type: 'expense',
        originalText: text,
        merchant: processedData.merchant,
        location: processedData.location,
        paymentMethod: processedData.paymentMethod,
        tags: processedData.tags,
        confidence: processedData.confidence,
        aiProcessed: true,
        suggestions: processedData.suggestions,
        aiCategory: processedData.category,
        aiAmount: processedData.amount,
        aiDescription: processedData.description,
        processingStatus: 'completed',
        lastProcessedAt: randomDate
      });
      
      aiExpenses.push(aiExpense);
    }
    
    // Bulk insert all data
    console.log('💾 Saving expense data to database...');
    const savedExpenses = await Expense.insertMany(expenses);
    console.log(`✅ Saved ${savedExpenses.length} regular expenses`);
    
    console.log('💾 Saving AI processed data for RAG training...');
    const savedAIExpenses = await AIExpense.insertMany(aiExpenses);
    console.log(`✅ Saved ${savedAIExpenses.length} AI expense entries`);
    
    // Generate summary statistics
    const stats = await AIExpense.getDatasetStats(userId);
    
    console.log('\n📊 GENERATED DATA SUMMARY:');
    console.log(`👤 User ID: ${userId}`);
    console.log(`💰 Total Expenses: ${savedExpenses.length}`);
    console.log(`🤖 AI Processed Entries: ${savedAIExpenses.length}`);
    console.log(`🎯 Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
    
    // Calculate total spending by category
    const categoryTotals = {};
    savedExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    console.log('\n💳 SPENDING BY CATEGORY:');
    Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, total]) => {
        console.log(`${category}: ${total.toFixed(2)}`);
      });
    
    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    console.log(`\n💰 TOTAL MONTHLY SPENDING: ${totalSpending.toFixed(2)}`);
    
    console.log('\n🎉 Sample data generation completed successfully!');
    console.log('🔥 Your app now has a full month of realistic expense data for testing RAG implementation.');
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  }
}

// Function to clear all data for a user
async function clearUserData(userId) {
  try {
    const expensesDeleted = await Expense.deleteMany({ userId });
    const aiExpensesDeleted = await AIExpense.deleteMany({ userId });
    
    console.log(`🗑️ Cleared data for User ID: ${userId}`);
    console.log(`- Deleted ${expensesDeleted.deletedCount} regular expenses`);
    console.log(`- Deleted ${aiExpensesDeleted.deletedCount} AI expense entries`);
    
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
}

// Run the script
async function main() {
  try {
    await connectDB();
    
    // Change this to your actual user ID or use command line argument
    const userId = process.argv[2] ? parseInt(process.argv[2]) : 12345;
    
    console.log('🚀 AI Expense Tracker - Sample Data Generator');
    console.log('===============================================');
    
    // Uncomment the next line if you want to clear existing data first
    // await clearUserData(userId);
    
    await generateSampleData(userId);
    
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  generateSampleData,
  clearUserData,
  connectDB
};

// Run if called directly
if (require.main === module) {
  main();
}