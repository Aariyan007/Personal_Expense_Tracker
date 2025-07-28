import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Bell, Settings, User, Wallet, Search } from 'lucide-react';
import { useState } from 'react';

const navItems = ['Dashboard', 'Transactions', 'AI-PLANNER', 'Settings'];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  
  // Animation variants for the main navbar background
  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20, 
        delay: 0.2 
      } 
    },
  };

  // Animation variants for individual nav items
  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Animation variants for the mobile menu
  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 20 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -50, 
      scale: 0.95,
      transition: { duration: 0.3 } 
    },
  };

  return (
    <motion.div
      className="relative z-50"
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      {/* Main Navbar */}
      <div className="fixed w-full bg-white/5 backdrop-blur-2xl shadow-2xl border-b border-white/10 supports-[backdrop-filter]:bg-white/5">
        {/* Glassmorphism overlay effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
        
        {/* Animated background particles */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2s"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-indigo-600/80 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <Wallet className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-white text-2xl font-extrabold tracking-wide bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                  ExpenseAI
                </h1>
                <p className="text-xs text-white/60 font-medium">Smart Finance</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden md:flex items-center space-x-1 bg-white/5 rounded-2xl p-2 backdrop-blur-md border border-white/10"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {navItems.map((item, index) => (
                <motion.a
                  key={index}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-white/90 text-sm font-medium px-6 py-3 rounded-xl hover:text-white transition-all duration-300 group overflow-hidden"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Hover background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"></div>
                  
                  {/* Text */}
                  <span className="relative z-10 uppercase tracking-wider">{item}</span>
                  
                  {/* Underline effect */}
                  <span className="absolute left-4 right-4 bottom-1 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
                </motion.a>
              ))}
            </motion.div>

            {/* Right Section - Search & Profile */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search Button */}
              <motion.button
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-md border border-white/10 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-md border border-white/10 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white/20 animate-pulse"></span>
              </motion.button>

              {/* Settings */}
              <motion.button
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-md border border-white/10 group"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Settings className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
              </motion.button>

              {/* Profile */}
              <motion.div
                className="relative ml-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-11 h-11 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border-2 border-white/20">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-md opacity-30 hover:opacity-50 transition-opacity duration-300"></div>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setOpen(!open)}
                className="text-white/90 hover:text-white focus:outline-none p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {open ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <motion.div
          className="md:hidden fixed top-20 w-full bg-white/5 backdrop-blur-2xl text-white shadow-2xl border-b border-white/10 overflow-hidden"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={mobileMenuVariants}
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-indigo-500/10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent"></div>
          
          <div className="relative space-y-2 py-6 px-6">
            {navItems.map((item, index) => (
              <motion.a
                key={index}
                href={`#${item.toLowerCase()}`}
                className="block text-base font-medium py-4 px-6 rounded-xl hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/20 backdrop-blur-sm group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.1 }
                }}
                whileHover={{ x: 5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-wide text-white/90 group-hover:text-white transition-colors">
                    {item}
                  </span>
                  <motion.div
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.5 }}
                  ></motion.div>
                </div>
              </motion.a>
            ))}
            
            {/* Mobile Profile Section */}
            <motion.div
              className="mt-6 pt-6 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
            >
              <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">John Doe</p>
                  <p className="text-white/60 text-sm">Premium User</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        .animation-delay-2s {
          animation-delay: 2s;
        }
        
        @supports (backdrop-filter: blur(40px)) {
          .backdrop-blur-2xl {
            backdrop-filter: blur(40px);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Navbar;