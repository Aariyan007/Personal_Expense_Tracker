// Simple script to quickly generate sample data
// Run with: node runGeneration.js

const { generateSampleData, connectDB } = require('./scripts/generateSampleData');

async function quickGenerate() {
  console.log('🚀 Quick Sample Data Generation');
  console.log('==============================');
  
  try {
    await connectDB();
    
    // Use your actual user ID here - change this number!
    const userId = 12345; // Replace with your real user ID
    
    console.log(`Generating data for User ID: ${userId}`);
    await generateSampleData(userId);
    
    console.log('\n✅ COMPLETE! Your expense tracker now has:');
    console.log('   - 1 month of realistic expense data');
    console.log('   - Natural language variations for AI training');
    console.log('   - AI processing metadata for RAG preparation');
    console.log('\n🎯 Next: Test your AI processing endpoints!');
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  } finally {
    process.exit(0);
  }
}

quickGenerate();