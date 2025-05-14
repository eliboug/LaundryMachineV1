import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onSignupClick }) => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, resetPassword, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await login(
        emailRef.current.value, 
        passwordRef.current.value
      );
      
      setMessage('Logged in successfully!');
    } catch (error) {
      setError(`Failed to log in: ${error.message}`);
    }
    
    setLoading(false);
  }
  
  async function handleForgotPassword(e) {
    e.preventDefault();
    
    if (!emailRef.current.value) {
      return setError('Please enter your email address');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await resetPassword(emailRef.current.value);
      setMessage('Check your email inbox for password reset instructions');
      setShowForgotPassword(false);
    } catch (error) {
      setError(`Failed to reset password: ${error.message}`);
    }
    
    setLoading(false);
  }
  
  function toggleForgotPassword() {
    setShowForgotPassword(prevState => !prevState);
    setError('');
    setMessage('');
  }

  return (
    <div className="auth-form">
      <h2>{showForgotPassword ? 'Reset Password' : 'Log In'}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      
      {showForgotPassword ? (
        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              ref={emailRef} 
              required 
              className="form-control"
              placeholder="Enter your email address" 
            />
          </div>
          
          <button disabled={loading} type="submit" className="btn-primary">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <div className="auth-link">
            <button 
              type="button" 
              onClick={toggleForgotPassword} 
              className="text-link"
            >
              Back to Login
            </button>
          </div>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                ref={emailRef} 
                required 
                className="form-control" 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                ref={passwordRef} 
                required 
                className="form-control" 
              />
            </div>
            
            <button disabled={loading} type="submit" className="btn-primary">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="forgot-password">
            <button 
              type="button" 
              onClick={toggleForgotPassword} 
              className="text-link"
            >
              Forgot password?
            </button>
          </div>
          
          <div className="auth-link">
            Don't have an account? <button onClick={onSignupClick}>Sign Up</button>
          </div>
        </>
      )}
      
      <style jsx="true">{`
        .text-link {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          text-decoration: underline;
        }
        
        .text-link:hover {
          color: #0056b3;
        }
        
        .forgot-password {
          text-align: right;
          margin-top: 8px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default Login;
