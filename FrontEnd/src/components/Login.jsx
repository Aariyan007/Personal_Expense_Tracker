import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from './context/UserDataContext.jsx';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { user, setuserData } = React.useContext(UserDataContext);

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
      className="absolute w-2 h-2 bg-white/20 rounded-full"
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 100 - 50, 0],
        opacity: [0, 1, 0]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }}
    />
  ));

  const handleSubmit = async (e) => {

    e.preventDefault();
    const userData = {
      email: formData.email,
      password: formData.password
    }
    try {

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/login`, userData);

      if (response.status === 200) {
        const data = response.data;
        console.log(response.data);

        setuserData(data.user);
        localStorage.setItem('token', data.token);
        // setuserData(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.login_count === 0) {
          navigate('/onboarding/step-1');
        }
        else {
          navigate('/home');
        }
      }

      // console.log('Form submitted:', formData);
    } catch (error) {
        navigate('/login');
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
        setFormData({
          email: '',
          password: ''
        });
      }
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
      <motion.div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        variants={backgroundVariants}
        animate="animate"
      >
        {/* Floating Particles */}
        {floatingParticles}

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <motion.div
          className="w-full max-w-md relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Brand */}
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to your account</p>
          </motion.div>

          {/* Form Container */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
            variants={itemVariants}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Toggle Buttons */}
            {/* <div className="flex bg-white/10 rounded-2xl p-1 mb-6"> */}


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div
                className="relative"
                variants={inputVariants}
                whileFocus="focus"
                initial="blur"
              >
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                className="relative"
                variants={inputVariants}
                whileFocus="focus"
                initial="blur"
              >
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <motion.button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white/70">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <motion.a
                  href="#"
                  className="text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Forgot password?
                </motion.a>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center group transition-all"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2">Sign In</span>
                <motion.div
                  className="group-hover:translate-x-1 transition-transform"
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="flex items-center justify-center">
                <motion.button
                  type="button"
                  className="flex cursor-pointer w-2xl items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </motion.button>
              </div>
            </form>

            {/* Sign Up Link */}
            <motion.div
              className="text-center mt-6"
              variants={itemVariants}
            >
              <p className="text-white/70">
                Don't have an account?{' '}
                <motion.a onClick={() => navigate('/register')}
                  href="#"
                  className="text-white font-semibold hover:underline"
                  whileHover={{ scale: 1.05 }}
                >
                  Sign up
                </motion.a>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8 text-white/50 text-sm"
            variants={itemVariants}
          >
            <p>© 2025 Lynux. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  export default Login;