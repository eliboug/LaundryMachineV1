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
    <div className="auth-form">
      <h2>Sign Up</h2>
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
        
        <div className="form-group">
          <label>Password Confirmation</label>
          <input 
            type="password" 
            ref={passwordConfirmRef} 
            required 
            className="form-control" 
          />
        </div>
        
        <button disabled={loading} type="submit" className="btn-primary">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="auth-link">
        Already have an account? <button onClick={onLoginClick}>Log In</button>
      </div>
    </div>
  );
};

export default Signup;
