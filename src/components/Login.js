import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onSignupClick }) => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  return (
    <div className="auth-form">
      <h2>Log In</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      
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
      
      <div className="auth-link">
        Don't have an account? <button onClick={onSignupClick}>Sign Up</button>
      </div>
    </div>
  );
};

export default Login;
