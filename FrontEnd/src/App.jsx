import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from './components/loader/loader.jsx';

const Login = lazy(() => import('./components/Login'));
const Home = lazy(() => import('./components/Home'));
const Register = lazy(() => import('./components/Register'));

const App = () => {
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 3000); 
    setMinLoading(true);

    return () => clearTimeout(timer);
  }, []);

  if (minLoading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Suspense>
  );
};

export default App;
