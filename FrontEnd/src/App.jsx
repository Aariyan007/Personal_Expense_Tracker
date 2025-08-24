import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/loader/loader.jsx';
import UserLogOut from './components/userLogOut.jsx';
import UserProtectedWrapper from './components/UserProtectedWrapper.jsx';
import Onboarding1 from './components/onBoarding/onBoarding1.jsx';
import Onboarding2 from './components/onBoarding/onBoarding2.jsx';

// Lazy loaded components
const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./components/Home'));
const Register = lazy(() => import('./components/Register'));
const Landing = lazy(() => import('./components/Landing.jsx'));
const ViewAnalytics = lazy(() => import('./components/ViewAnalytics.jsx'));

const App = () => {
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (minLoading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={
          <UserProtectedWrapper>
            <Home />
          </UserProtectedWrapper>
        } />
        <Route path="/analytics" element={
          <UserProtectedWrapper>
            <ViewAnalytics />
          </UserProtectedWrapper>
        } />
        <Route path="/users/logout" element={
          <UserProtectedWrapper>
            <UserLogOut />
          </UserProtectedWrapper>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding/step-1" element={<Onboarding1 />} />
        <Route path="/onboarding/step-2" element={<Onboarding2 />} />
      </Routes>
    </Suspense>
  );
};

export default App;