import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material'; 
import Home from './components/Home';
import Login from './components/Login';

import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
 
import Account from './components/Account';

import { useAuth } from './contexts/AuthContext';

import './styles/mui-overrides.css';
import './styles/main.css';

import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const hideFooterRoutes = ['/login', '/register'];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <Header />
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        pb: shouldShowFooter ? 8 : 0,
        
      }}> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </Box>
      {shouldShowFooter && <Footer />}
    </Box>
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;