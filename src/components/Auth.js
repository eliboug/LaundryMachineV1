import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { currentUser, logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogout() {
    setError('');
    setLogoutLoading(true);
    
    try {
      await logout();
    } catch {
      setError('Failed to log out');
    }
    
    setLogoutLoading(false);
  }

  return (
    <div className="auth-container">
      {currentUser ? (
        <div className="user-profile">
          <h3>Profile</h3>
          <p><strong>Email:</strong> {currentUser.email}</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <button 
            onClick={handleLogout} 
            disabled={logoutLoading}
            className="btn-logout"
          >
            {logoutLoading ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      ) : (
        <>
          {showLogin ? (
            <Login onSignupClick={() => setShowLogin(false)} />
          ) : (
            <Signup onLoginClick={() => setShowLogin(true)} />
          )}
        </>
      )}
    </div>
  );
};

export default Auth;
