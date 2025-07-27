import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function OnboardingStep1({ onNext }) {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || ''); // Set the name or an empty string if not found
  }, []);

  const handleNext = () => {
    navigate('/onboarding/step-2'); // Proceed to the next step (e.g., the main app dashboard)
  };

  // Framer Motion variants for overall page entrance
  const pageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
        staggerChildren: 0.2, // Stagger animations of child elements
        delayChildren: 0.2, // Delay before children start animating
      },
    },
  };

  // Framer Motion variants for individual elements
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center text-white px-6 py-12 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      style={{
        background: 'linear-gradient(135deg, #4c119e 0%, #2575fc 100%)' // Consistent gradient background
      }}
    >
      {/* Subtle background circles for added visual interest (reused from previous design) */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Tailwind CSS keyframes for blob animation */}
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

      <motion.h1
        className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white drop-shadow-lg mb-4 text-center z-10"
        variants={itemVariants}
      >
        Welcome back, {userName || 'FinBot User'}! 👋
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl mb-10 text-center max-w-lg text-blue-100 leading-relaxed z-10"
        variants={itemVariants}
      >
        Ready to dive back into your financial journey?
      </motion.p>

      <motion.div
        className="w-full max-w-sm p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-10 flex justify-center" // Added flex and justify-center
        variants={itemVariants}
      >
        <motion.button
          onClick={handleNext}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg
                     hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Let's Go! &rarr;
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default OnboardingStep1;
