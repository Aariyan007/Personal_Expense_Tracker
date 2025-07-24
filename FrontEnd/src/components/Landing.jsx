import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // Load GSAP
        if (typeof window !== 'undefined' && !window.gsap) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
            script.onload = () => {
                initAnimations();
            };
            document.head.appendChild(script);
        } else if (window.gsap) {
            initAnimations();
        }

        const initAnimations = () => {
            const { gsap } = window;
            if (!gsap) return;

            // Simple hero animations
            const tl = gsap.timeline();
            tl.from('.hero-title', {
                duration: 1,
                y: 50,
                opacity: 0,
                ease: 'power3.out'
            })
                .from('.hero-subtitle', {
                    duration: 0.8,
                    y: 30,
                    opacity: 0,
                    ease: 'power3.out'
                }, '-=0.5')
                .from('.hero-buttons', {
                    duration: 0.6,
                    y: 20,
                    opacity: 0,
                    ease: 'power3.out'
                }, '-=0.3');

            // Random floating animations for cards
            gsap.to('.floating-card-1', {
                x: 'random(-30, 30)',
                y: 'random(-20, 20)',
                rotation: 'random(-5, 5)',
                duration: 'random(3, 5)',
                repeat: -1,
                yoyo: true,
                ease: 'power2.inOut'
            });

            gsap.to('.floating-card-2', {
                x: 'random(-25, 25)',
                y: 'random(-30, 30)',
                rotation: 'random(-3, 3)',
                duration: 'random(4, 6)',
                repeat: -1,
                yoyo: true,
                ease: 'power2.inOut',
                delay: 1
            });

            // Animated background gradients
            gsap.to('.bg-orb-1', {
                x: 'random(-100, 100)',
                y: 'random(-80, 80)',
                scale: 'random(0.8, 1.2)',
                duration: 'random(8, 12)',
                repeat: -1,
                // yoyo: true,
                ease: 'power1.inOut'
            });

            gsap.to('.bg-orb-2', {
                x: 'random(-120, 120)',
                y: 'random(-100, 100)',
                scale: 'random(0.9, 1.3)',
                duration: 'random(10, 15)',
                repeat: -1,
                // yoyo: true,
                ease: 'power1.inOut',
                delay: 2
            });

            gsap.to('.bg-orb-3', {
                x: 'random(-80, 80)',
                y: 'random(-60, 60)',
                scale: 'random(0.7, 1.1)',
                duration: 'random(6, 10)',
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
                delay: 4
            });
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <section className="h-screen flex items-center justify-center relative overflow-hidden">
                {/* Base gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>

                {/* Animated Background Effects */}
                <div className="absolute inset-0">
                    {/* Moving gradient orbs */}
                    <div className="bg-orb-1 absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
                    <div className="bg-orb-2 absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"></div>
                    <div className="bg-orb-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>

                    {/* Animated gradient overlay */}
                    <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                            background: 'linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
                            animation: 'gradientShift 8s ease-in-out infinite'
                        }}
                    ></div>
                </div>

                {/* Add CSS animation for gradient */}
                <style jsx>{`
          @keyframes gradientShift {
            0%, 100% { 
              background: linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
              transform: translateX(-100%);
            }
            50% { 
              background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%);
              transform: translateX(100%);
            }
          }
        `}</style>

                <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium">Powered by AI</span>
                        </div>
                    </motion.div>

                    {/* Main Title */}
                    <h1 className="hero-title text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                        ExpenseAI
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-10 font-light max-w-3xl mx-auto">
                        Smart expense tracking powered by AI. Automatically categorize, analyze, and optimize your spending.
                    </p>

                    {/* Buttons */}
                    <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button onClick={()=>{
                            navigate('/login');
                        }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-lg font-semibold transition-transform duration-300 shadow-xl will-change-transform"
                        >
                            Start Free Trial
                        </motion.button>


                    </div>
                </div>

                {/* Floating Cards with Random Movement */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="floating-card-1 absolute bottom-20 left-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-xs"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium">AI Analysis</span>
                    </div>
                    <p className="text-2xl font-bold">$2,847</p>
                    <p className="text-sm text-gray-400">Savings identified</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="floating-card-2 absolute top-20 right-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-xs"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-medium">Spending Trend</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">↓ 24%</p>
                    <p className="text-sm text-gray-400">vs last month</p>
                </motion.div>
            </section>

            {/* Next Section - Features */}
            <section className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mb-16"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI-Powered Features
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Experience the future of expense management with cutting-edge AI technology
                        </p>
                    </motion.div>

                    {/* Feature Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 group hover:scale-105"
                        >
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Smart Categorization
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                AI automatically categorizes your expenses with 99% accuracy, learning from your spending patterns.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 group hover:scale-105"
                        >
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Predictive Analytics
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Get AI-powered predictions about your future spending and personalized budget recommendations.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300 group hover:scale-105"
                        >
                            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Real-time Insights
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Get instant insights into your spending habits with AI-generated reports and actionable advice.
                            </p>
                        </motion.div>
                    </div>

                    {/* Stats Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-20 grid md:grid-cols-4 gap-8"
                    >
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-400 mb-2">7K+</div>
                            <div className="text-gray-400">Expenses Tracked</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-400 mb-2">90%</div>
                            <div className="text-gray-400">AI Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-400 mb-2">$25,000</div>
                            <div className="text-gray-400">Money Saved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-pink-400 mb-2">10K+</div>
                            <div className="text-gray-400">Happy Users</div>
                        </div>
                    </motion.div>

                    {/* Final CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mt-20"
                    >
                        <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Ready to transform your finances?
                        </h3>
                        <motion.button
                            onClick={()=>{
                                navigate('/login');
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 rounded-full text-lg font-semibold transition-transform duration-300 shadow-xl will-change-transform"
                        >
                            Let's Go
                        </motion.button>

                    </motion.div>
                </div>
            </section>

            {/* Third Page - How It Works */}
            <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 py-20 px-6 relative overflow-hidden">
                {/* Background Animation */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            Get started in minutes with our intelligent AI-powered expense tracking system
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <div className="space-y-20">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex flex-col lg:flex-row items-center gap-12"
                        >
                            <div className="lg:w-1/2">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-2xl font-bold text-white">1</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-white">Connect Your Accounts</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Securely link your bank accounts, credit cards, and payment apps. Our advanced encryption ensures your data stays safe while our AI learns your spending patterns.
                                </p>
                            </div>
                            <div className="lg:w-1/2">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-2xl"
                                >
                                    <div className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                                            <span className="text-white">Chase Bank</span>
                                            <span className="text-green-400 ml-auto">✓ Connected</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-500 rounded-lg"></div>
                                            <span className="text-white">Credit Card</span>
                                            <span className="text-green-400 ml-auto">✓ Connected</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-500 rounded-lg"></div>
                                            <span className="text-white">PayPal</span>
                                            <span className="text-yellow-400 ml-auto">⟳ Syncing...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex flex-col lg:flex-row-reverse items-center gap-12"
                        >
                            <div className="lg:w-1/2">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-2xl font-bold text-white">2</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-white">AI Categorizes Everything</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Our intelligent AI automatically categorizes your transactions with 99% accuracy. No more manual entry - just sit back and watch as everything gets organized.
                                </p>
                            </div>
                            <div className="lg:w-1/2">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-2xl"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                            <div>
                                                <div className="text-white font-medium">Starbucks Coffee</div>
                                                <div className="text-gray-400 text-sm">-$4.95</div>
                                            </div>
                                            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">Food & Dining</div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                            <div>
                                                <div className="text-white font-medium">Uber Ride</div>
                                                <div className="text-gray-400 text-sm">-$18.50</div>
                                            </div>
                                            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Transportation</div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                            <div>
                                                <div className="text-white font-medium">Netflix</div>
                                                <div className="text-gray-400 text-sm">-$15.99</div>
                                            </div>
                                            <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">Entertainment</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex flex-col lg:flex-row items-center gap-12"
                        >
                            <div className="lg:w-1/2">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-2xl font-bold text-white">3</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-white">Get Smart Insights</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Receive personalized insights, spending predictions, and actionable recommendations to optimize your budget and reach your financial goals faster.
                                </p>
                            </div>
                            <div className="lg:w-1/2">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-2xl"
                                >
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
                                            <h4 className="text-green-400 font-semibold mb-2">💡 Smart Tip</h4>
                                            <p className="text-gray-300 text-sm">You could save $180/month by reducing dining out by 30%</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
                                            <h4 className="text-blue-400 font-semibold mb-2">📊 Trend Alert</h4>
                                            <p className="text-gray-300 text-sm">Your entertainment spending is 25% higher than last month</p>
                                        </div>
                                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
                                            <h4 className="text-purple-400 font-semibold mb-2">🎯 Goal Progress</h4>
                                            <p className="text-gray-300 text-sm">You're 78% towards your $5,000 savings goal!</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Final CTA for Page 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mt-20"
                    >
                        <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Ready to take control of your finances?
                        </h3>
                        <p className="text-gray-400 mb-8 text-lg">
                            Join over 500,000 users who trust ExpenseAI with their financial future
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button onClick={()=>{
                                navigate('/login');
                            }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 rounded-full text-lg font-semibold transition-transform duration-300 shadow-xl will-change-transform"
                            >
                                Start Your Free Trial
                            </motion.button>

                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Landing;