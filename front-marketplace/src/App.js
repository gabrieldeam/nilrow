import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login/Login';
import LoginPhone from './pages/Auth/LoginPhone/LoginPhone';
import Signup from './pages/Auth/Signup/Signup';
import PasswordReset from './pages/Auth/PasswordReset/PasswordReset';
import './styles/global.css';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login-phone" element={<LoginPhone />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/password-reset" element={<PasswordReset />} />
        </Routes>
    </Router>
  );
}

export default App;
