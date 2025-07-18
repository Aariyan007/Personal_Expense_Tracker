import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const backgroundVariants = {
        animate: {
            background: [
                "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
                "linear-gradient(45deg, #764ba2 0%, #667eea 100%)",
                "linear-gradient(45deg, #667eea 0%, #764ba2 100%)"
            ],
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const floatingParticles = Array.from({ length: 6 }, (_, i) => (
        <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white/20 rounded-full"
            style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
            }}
            animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
            }}
        />
    ));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Handle form submission
        console.log('Registration form submitted:', formData);
    };

    const handleSignIn = () => {
        // Navigate to login page - replace with your routing logic
        navigate('/login');
    };

    const inputVariants = {
        focus: {
            scale: 1.02,
            transition: { duration: 0.2 }
        },
        blur: {
            scale: 1,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Top Navigation Bar */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 right-0 z-50 p-6"
            >
                <div className="max-w-7xl mx-auto flex justify-center items-center">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-xl font-bold flex items-center justify-center">Expense Tracker</span>
                    </motion.div>

                    {/* Navigation Buttons */}
                </div>
            </motion.nav>

            {/* Animated Background */}
            <motion.div
                className="absolute inset-0 w-full h-full"
                variants={backgroundVariants}
                animate="animate"
            />

            {/* Floating Particles */}
            {floatingParticles}

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Main Content */}
            <motion.div
                className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="w-full max-w-md">
                    {/* Logo/Brand */}
                    <motion.div
                        variants={itemVariants}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Create Account
                        </h1>
                        <p className="text-white/80">
                            Join us today and get started
                        </p>
                    </motion.div>

                    {/* Form Container */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <motion.div variants={inputVariants} className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </motion.div>

                            {/* Email Input */}
                            <motion.div variants={inputVariants} className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </motion.div>

                            {/* Password Input */}
                            <motion.div variants={inputVariants} className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full pl-12 pr-12 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <motion.button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                                    onClick={() => setShowPassword(!showPassword)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </motion.button>
                            </motion.div>

                            {/* Confirm Password Input */}
                            <motion.div variants={inputVariants} className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className="w-full pl-12 pr-12 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <motion.button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </motion.button>
                            </motion.div>

                            {/* Terms & Conditions */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="w-4 h-4 text-white bg-white/20 border-white/30 rounded focus:ring-white/50"
                                    required
                                />
                                <label htmlFor="terms" className="text-sm text-white/80">
                                    I agree to the{' '}
                                    <a href="#" className="text-white hover:underline">
                                        Terms of Service
                                    </a>
                                    {' '}and{' '}
                                    <a href="#" className="text-white hover:underline">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                className="w-full cursor-pointer bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center justify-center space-x-2 group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>Create Account</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/30"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 text-white/60 bg-transparent">
                                        or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-1 gap-3">
                                <motion.button
                                    type="button"
                                    className="w-full cursor-pointer bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl border border-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className=''> Google</span>
                                </motion.button>
                            </div>

                            {/* Sign In Link */}
                            <div className="text-center mt-6">
                                <p className="text-white/80">
                                    Already have an account?{' '}
                                    <motion.button
                                        onClick={handleSignIn}
                                        type="button"
                                        className="text-white font-semibold hover:underline cursor-pointer"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        Sign in
                                    </motion.button>
                                </p>
                            </div>
                        </form>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        variants={itemVariants}
                        className="text-center mt-8 text-white/60 text-sm"
                    >
                        © 2025 Your Company. All rights reserved.
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;