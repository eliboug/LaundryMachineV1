import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Signup = ({ onLoginClick }) => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Check if passwords match
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }
    
    // Check if email is from thacher.org domain
    const email = emailRef.current.value;
    if (!email.endsWith('@thacher.org')) {
      return setError('Only @thacher.org email addresses are allowed to register');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await signup(
        email, 
        passwordRef.current.value
      );
      
      setMessage('Account created successfully!');
    } catch (error) {
      setError(`Failed to create an account: ${error.message}`);
    }
    
    setLoading(false);
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
          <h1>Sign Up</h1>
          <p className="tagline">Create your LaundryOnline account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <i className="email-icon"></i>
                <input
                  type="email"
                  ref={emailRef}
                  required
                  placeholder="yourname@thacher.org"
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
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password Confirmation</label>
              <div className="input-with-icon">
                <i className="password-icon"></i>
                <input
                  type="password"
                  ref={passwordConfirmRef}
                  required
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button disabled={loading} type="submit" className="btn-submit">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="form-footer signup-prompt">
          <span>Already have an account?</span>{' '}
          <button className="link-btn" type="button" onClick={onLoginClick}>Log In</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
