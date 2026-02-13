import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './Auth.css';

const Login = ({ setAuth, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('other');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showBranchPrompt, setShowBranchPrompt] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const navigate = useNavigate();

  const BRANCH_OPTIONS = [
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'eee', label: 'Electrical & Electronics' },
    { value: 'me', label: 'Mechanical Engineering' },
    { value: 'ce', label: 'Civil Engineering' },
    { value: 'it', label: 'Information Technology' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8001/api/auth/login/', {
        email,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setAuth(true);
      setUser(user);

      // Redirect based on user role
      if (user.role === 'organizer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleCredential(credentialResponse);
    setShowBranchPrompt(true);
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const submitGoogleLogin = async () => {
    if (!googleCredential) return;

    setGoogleLoading(true);
    setError('');

    try {
      // Decode the JWT to get user info
      const token = googleCredential.credential;
      const decodedToken = parseJwt(token);

      const response = await axios.post('http://localhost:8001/api/users/google_login/', {
        token: token,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        branch: branch,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setAuth(true);
      setUser(user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed. Please try again.');
      setShowBranchPrompt(false);
      setGoogleCredential(null);
    } finally {
      setGoogleLoading(false);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Error parsing JWT:', err);
      return {};
    }
  };

  if (showBranchPrompt) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Select Your Branch</h1>
            <p>Complete your profile for attendance tracking</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="branch-selector">
            <label htmlFor="branch">Which branch are you from?</label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="branch-select"
            >
              {BRANCH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="button-group">
            <button
              onClick={submitGoogleLogin}
              disabled={googleLoading}
              className="btn btn-primary btn-lg"
            >
              {googleLoading ? 'Logging in...' : 'Confirm & Login'}
            </button>
            <button
              onClick={() => {
                setShowBranchPrompt(false);
                setGoogleCredential(null);
                setBranch('other');
              }}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Google login disabled - configure OAuth client ID in .env to enable */}
        {/* <div className="divider">
          <span>or</span>
        </div>

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
            text="signin_with"
          />
        </div> */}

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-visual">
        <div className="visual-card">🎫</div>
        <div className="visual-card">🎵</div>
        <div className="visual-card">🎬</div>
      </div>
    </div>
  );
};

export default Login;
