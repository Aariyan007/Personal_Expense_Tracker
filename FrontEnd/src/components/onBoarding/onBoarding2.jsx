import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function OnboardingStep2({ onNext, onBack }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    currency: 'USD',
    primaryGoal: '',
    budgetPreference: '',
    expenseCategories: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const goals = [
    { id: 'save', label: 'Save More Money', icon: '💰', desc: 'Build your savings systematically' },
    { id: 'budget', label: 'Better Budgeting', icon: '📊', desc: 'Track and control spending' },
    { id: 'invest', label: 'Investment Planning', icon: '📈', desc: 'Plan for long-term wealth' },
    { id: 'debt', label: 'Debt Management', icon: '💳', desc: 'Pay off debts efficiently' }
  ];

  const budgetTypes = [
    { id: '50-30-20', label: '50/30/20 Rule', desc: 'Needs, Wants, Savings' },
    { id: 'zero-based', label: 'Zero-Based Budget', desc: 'Every dollar has a purpose' },
    { id: 'envelope', label: 'Envelope Method', desc: 'Category-based spending' },
    { id: 'flexible', label: 'Flexible Budget', desc: 'Adaptive spending plan' }
  ];

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Travel', 'Education',
    'Groceries', 'Subscriptions'
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      expenseCategories: prev.expenseCategories.includes(category)
        ? prev.expenseCategories.filter(c => c !== category)
        : [...prev.expenseCategories, category]
    }));
    // Clear error when user makes selection
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmitForm = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    const userDetails = {
      monthlyIncome: parseFloat(formData.monthlyIncome),
      currency: formData.currency,
      primaryGoal: formData.primaryGoal,
      budgetPreference: formData.budgetPreference,
      expenseCategories: formData.expenseCategories
    };
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/onboarding-2`, userDetails, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = response.data;
      console.log('Form completed successfully:', result);
      alert('Your onboarding information has been saved successfully!');
      navigate('/home');
      
      
      if (onNext) onNext(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      if (onBack) onBack();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.monthlyIncome.trim() !== '';
      case 1: return formData.primaryGoal !== '';
      case 2: return formData.budgetPreference !== '';
      case 3: return formData.expenseCategories.length >= 3;
      default: return false;
    }
  };

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    hover: {
      scale: 1.02,
      transition: { type: 'spring', stiffness: 400, damping: 17 }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              What's your monthly income? 💵
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code} className="bg-purple-800 text-white">
                      {curr.symbol} {curr.code}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="monthlyIncome"
                  placeholder="Enter amount"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-blue-200 text-center">
                This helps us create personalized budgets and savings goals
              </p>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              What's your primary financial goal? 🎯
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <motion.label
                  key={goal.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 block ${formData.primaryGoal === goal.id
                      ? 'bg-purple-500/30 border-purple-300 shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                >
                  <input
                    type="radio"
                    name="primaryGoal"
                    value={goal.id}
                    checked={formData.primaryGoal === goal.id}
                    onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div className="text-3xl mb-2">{goal.icon}</div>
                  <h3 className="font-semibold text-lg mb-1">{goal.label}</h3>
                  <p className="text-sm text-blue-200">{goal.desc}</p>
                </motion.label>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              Choose your budgeting style 📋
            </h2>
            <div className="space-y-3">
              {budgetTypes.map((budget) => (
                <motion.label
                  key={budget.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 block ${formData.budgetPreference === budget.id
                      ? 'bg-purple-500/30 border-purple-300 shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                >
                  <input
                    type="radio"
                    name="budgetPreference"
                    value={budget.id}
                    checked={formData.budgetPreference === budget.id}
                    onChange={(e) => handleInputChange('budgetPreference', e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{budget.label}</h3>
                      <p className="text-sm text-blue-200">{budget.desc}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${formData.budgetPreference === budget.id ? 'bg-purple-400 border-purple-400' : 'border-white/40'
                      }`} />
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              Select your main expense categories 🏷️
            </h2>
            <p className="text-center text-blue-200 mb-4">Choose at least 3 categories you spend on regularly</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <motion.label
                  key={category}
                  variants={cardVariants}
                  whileHover="hover"
                  className={`p-3 rounded-xl cursor-pointer border-2 text-center transition-all duration-300 block ${formData.expenseCategories.includes(category)
                      ? 'bg-purple-500/30 border-purple-300 shadow-lg shadow-purple-500/25'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                >
                  <input
                    type="checkbox"
                    name="expenseCategories"
                    value={category}
                    checked={formData.expenseCategories.includes(category)}
                    onChange={(e) => handleCategoryToggle(category)}
                    className="sr-only"
                  />
                  <p className="text-sm font-medium">{category}</p>
                </motion.label>
              ))}
            </div>
            <p className="text-center text-sm text-blue-300">
              Selected: {formData.expenseCategories.length} categories
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-white px-6 py-12 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      style={{
        background: 'linear-gradient(135deg, #4c119e 0%, #2575fc 100%)'
      }}
    >
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.3, 0.9);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Progress indicator */}
      <motion.div
        className="w-full max-w-md mb-8 z-10"
        variants={itemVariants}
      >
        <div className="flex justify-between mb-2">
          <span className="text-sm text-blue-200">Step {currentStep + 1} of 4</span>
          <span className="text-sm text-blue-200">{Math.round(((currentStep + 1) / 4) * 100)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-md">
          <motion.div
            className="bg-gradient-to-r from-purple-400 to-indigo-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="w-full max-w-2xl p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-10 mb-8"
        variants={itemVariants}
      >
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-center backdrop-blur-md"
          >
            {submitError}
          </motion.div>
        )}
        
        {renderStep()}
      </motion.div>

      {/* Navigation buttons */}
      <motion.div
        className="flex gap-4 z-10"
        variants={itemVariants}
      >
        <motion.button
          type="button"
          onClick={handleBack}
          disabled={isSubmitting}
          className={`font-semibold py-3 px-6 rounded-xl backdrop-blur-md border border-white/30 transition-all duration-300 ${
            isSubmitting 
              ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          ← Back
        </motion.button>

        <motion.button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid() || isSubmitting}
          className={`font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 ${
            isStepValid() && !isSubmitting
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 transform hover:-translate-y-1 hover:shadow-2xl'
              : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
          }`}
          whileHover={isStepValid() && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isStepValid() && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            currentStep === 3 ? 'Complete Setup! ✨' : 'Continue →'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default OnboardingStep2;