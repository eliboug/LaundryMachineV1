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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">
              <img src="/thacherlogo.png" alt="Thacher Logo" className="thacher-logo" />
            </div>
          </div>
          <h1>{showForgotPassword ? 'Reset Password' : 'LaundryOnline'}</h1>
          <p className="tagline">{showForgotPassword ? 'Enter your email to receive a reset link' : 'Monitor your laundry, anytime, anywhere'}</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        
        <div className="form-container">
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <i className="email-icon"></i>
                  <input 
                    type="email" 
                    ref={emailRef} 
                    required 
                    placeholder="yourname@example.com" 
                  />
                </div>
              </div>
              
              <button 
                disabled={loading} 
                type="submit" 
                className="btn-submit"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="form-footer">
                <button 
                  type="button" 
                  onClick={toggleForgotPassword} 
                  className="text-link"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <i className="email-icon"></i>
                    <input 
                      type="email" 
                      ref={emailRef} 
                      required 
                      placeholder="yourname@example.com" 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <div className="input-with-icon">
                    <i className="password-icon"></i>
                    <input 
                      type="password" 
                      ref={passwordRef} 
                      required 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                
                <div className="forgot-password">
                  <button 
                    type="button" 
                    onClick={toggleForgotPassword} 
                    className="text-link"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="btn-submit"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>
              
              <div className="form-footer signup-prompt">
                <span>Don't have an account?</span>
                <button 
                  onClick={onSignupClick} 
                  className="btn-signup"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <style jsx="true">{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          padding: 2rem;
          /* Removed background gradient as it's now applied to the parent */
        }
        
        .login-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .login-header {
          background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
          padding: 2rem 2rem 1.5rem;
          text-align: center;
          color: white;
        }
        
        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .logo {
          width: 100px;
          height: 100px;
          background-color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          padding: 5px;
        }
        
        .thacher-logo {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        
        .login-header h1 {
          margin: 0 0 0.5rem;
          font-size: 2rem;
          font-weight: 600;
        }
        
        .tagline {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
          font-weight: 300;
        }
        
        .form-container {
          padding: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }
        
        .input-with-icon {
          position: relative;
        }
        
        .input-with-icon i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          opacity: 0.6;
        }
        
        .email-icon {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>');
          background-repeat: no-repeat;
          background-size: contain;
          display: inline-block;
        }
        
        .password-icon {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>');
          background-repeat: no-repeat;
          background-size: contain;
          display: inline-block;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #4b6cb7;
          box-shadow: 0 0 0 3px rgba(75, 108, 183, 0.15);
        }
        
        .forgot-password {
          text-align: right;
          margin-bottom: 1.5rem;
        }
        
        .text-link {
          background: none;
          border: none;
          color: #4b6cb7;
          cursor: pointer;
          padding: 0;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        
        .text-link:hover {
          color: #334e89;
          text-decoration: underline;
        }
        
        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 6px rgba(75, 108, 183, 0.15);
        }
        
        .btn-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 10px rgba(75, 108, 183, 0.2);
        }
        
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .form-footer {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .signup-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #555;
        }
        
        .btn-signup {
          background: none;
          border: none;
          color: #4b6cb7;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }
        
        .btn-signup:hover {
          color: #334e89;
          text-decoration: underline;
        }
        
        .alert {
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }
        
        .alert-danger {
          background-color: #fff5f5;
          color: #e53e3e;
          border: 1px solid #fed7d7;
        }
        
        .alert-success {
          background-color: #f0fff4;
          color: #38a169;
          border: 1px solid #c6f6d5;
        }
      `}</style>
    </div>
  );
};

export default Login;
