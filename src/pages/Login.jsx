import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 2. Redirect based on email (Simple Role Check)
      if (email.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/faculty/dashboard');
      }

    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Uses the new manual CSS class for centering
    <div className="login-page-container">
      
      {/* Uses the wrapper class to fix width */}
      <div className="card login-card-wrapper"> 
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Portal Login</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email Input */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input" 
              placeholder="e.g., faculty@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}; // <--- THIS WAS LIKELY MISSING

export default Login;