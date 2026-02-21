// client/src/components/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredField, setHoveredField] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    try {
      // 1️⃣ Login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Get Firebase ID token
      const token = await user.getIdToken();

      // 3️⃣ Save token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.uid);

      // 4️⃣ Redirect to home
      navigate('/'); 
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Layered animated background - matching home page */}
      <div className="bg-base" />
      <div className="bg-noise" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-lines" />

      <div className="login-container">
        <div className="login-wrapper">
          {/* Hero Glass Card */}
          <div className="login-glass">
            <div className="glass-top-line" />
            
            {/* Brand Icon */}
            <div className="brand-icon-wrapper">
              <div className="brand-icon-ring">
                <span className="brand-icon">✦</span>
              </div>
            </div>

            {/* Login Header */}
            <div className="login-header">
              <h1 className="login-title">
                <span className="title-top">Welcome Back</span>
                <span className="title-bottom">Sign in to continue</span>
              </h1>
            </div>

            {/* Decorative Divider */}
            <div className="login-divider">
              <span className="divider-dot" />
              <span className="divider-line" />
              <span className="divider-diamond">◇</span>
              <span className="divider-line" />
              <span className="divider-dot" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
                <div className="error-glow" />
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="login-form">
              <div 
                className={`form-group ${hoveredField === 'email' ? 'field-hovered' : ''}`}
                onMouseEnter={() => setHoveredField('email')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="form-label">
                  <span className="label-icon">◈</span>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="form-input"
                    disabled={isLoading}
                  />
                  <div className="input-focus-ring" />
                  {hoveredField === 'email' && <span className="input-glow" />}
                </div>
              </div>

              <div 
                className={`form-group ${hoveredField === 'password' ? 'field-hovered' : ''}`}
                onMouseEnter={() => setHoveredField('password')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="form-label">
                  <span className="label-icon">◉</span>
                  Password
                </label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="form-input"
                    disabled={isLoading}
                  />
                  <div className="input-focus-ring" />
                  {hoveredField === 'password' && <span className="input-glow" />}
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading}
              >
                <span className="button-glow" />
                <span className="button-icon">
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    '✦'
                  )}
                </span>
                <span className="button-text">
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </span>
                <span className="button-arrow">→</span>
              </button>
            </form>

            {/* Additional Links */}
            <div className="login-links">
              <Link to="/register" className="link-item">
                <span className="link-icon">✦</span>
                <span className="link-text">Create Account</span>
                <span className="link-arrow">→</span>
              </Link>
              <Link to="/forgot-password" className="link-item">
                <span className="link-icon">◈</span>
                <span className="link-text">Forgot Password?</span>
                <span className="link-arrow">→</span>
              </Link>
              <Link to="/admin-login" className="link-item admin-link">
                <span className="link-icon">⚡</span>
                <span className="link-text">Admin Access</span>
                <span className="link-badge">Executive</span>
                <span className="link-arrow">→</span>
              </Link>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <div className="security-shield">
                <span className="shield-icon">🛡️</span>
                <div className="shield-ring" />
              </div>
              <div className="security-text">
                <span className="security-main">Secure Authentication</span>
                <span className="security-sub">Powered by Firebase</span>
              </div>
            </div>

            {/* Corner Decorations */}
            <div className="glass-corner-tl" />
            <div className="glass-corner-tr" />
            <div className="glass-corner-bl" />
            <div className="glass-corner-br" />
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --navy-darkest: #04101f;
          --navy-dark: #0a1929;
          --navy-mid: #0d2347;
          --navy-bright: #1338be;
          --blue-mid: #1a5fdb;
          --blue-vivid: #2979ff;
          --blue-light: #5c9fff;
          --blue-pale: #90c9ff;
          --blue-ghost: #c8e2ff;
          --white: #ffffff;
          --off-white: #f0f6ff;
          --glass-w10: rgba(255,255,255,0.10);
          --glass-w15: rgba(255,255,255,0.15);
          --glass-w20: rgba(255,255,255,0.20);
          --glass-border: rgba(255,255,255,0.18);
          --glass-border-bright: rgba(255,255,255,0.35);
          --text-on-dark: rgba(255,255,255,0.92);
          --text-muted-dark: rgba(180,215,255,0.80);
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'Outfit', system-ui, sans-serif;
          --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── ROOT ── */
        .login-root {
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── BACKGROUND SYSTEM (matching home page) ── */
        .bg-base {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(
            160deg,
            var(--navy-darkest) 0%,
            var(--navy-dark) 18%,
            var(--navy-mid) 38%,
            #0f3264 55%,
            #1a5fdb 75%,
            #3a7fd4 88%,
            #6fb3e8 100%
          );
        }

        .bg-noise {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .bg-orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          filter: blur(100px);
        }
        .bg-orb-1 {
          width: 700px; height: 700px; top: -200px; right: -150px;
          background: radial-gradient(circle, rgba(41,121,255,0.22), transparent 70%);
          animation: orb-drift 20s ease-in-out infinite alternate;
        }
        .bg-orb-2 {
          width: 500px; height: 500px; bottom: 0; left: -100px;
          background: radial-gradient(circle, rgba(10,22,40,0.5), transparent 70%);
          animation: orb-drift 25s ease-in-out infinite alternate-reverse;
        }
        .bg-orb-3 {
          width: 400px; height: 400px; top: 40%; left: 30%;
          background: radial-gradient(circle, rgba(92,159,255,0.15), transparent 70%);
          animation: orb-drift 18s ease-in-out 3s infinite alternate;
        }
        .bg-orb-4 {
          width: 300px; height: 300px; bottom: 20%; right: 10%;
          background: radial-gradient(circle, rgba(19,56,190,0.2), transparent 70%);
          animation: orb-drift 22s ease-in-out 6s infinite alternate-reverse;
        }

        @keyframes orb-drift {
          0% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,-30px) scale(1.1); }
          100% { transform: translate(-20px, 40px) scale(0.9); }
        }

        .bg-lines {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.04;
          background-image:
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        /* ── LOGIN CONTAINER ── */
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
          margin: 2rem auto;
          padding: 0 1.5rem;
        }

        .login-wrapper {
          width: 100%;
        }

        /* ── LOGIN GLASS CARD ── */
        .login-glass {
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(60px) saturate(200%);
          -webkit-backdrop-filter: blur(60px) saturate(200%);
          border-radius: 48px;
          border: 1px solid var(--glass-border);
          padding: 3rem 2.5rem;
          box-shadow: 0 40px 100px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 80px rgba(41,121,255,0.12);
          overflow: hidden;
        }

        .glass-top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(41,121,255,0.7), rgba(92,159,255,1), rgba(41,121,255,0.7), transparent);
          animation: shimmer-line 4s ease-in-out infinite;
        }

        @keyframes shimmer-line {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* Corner Decorations */
        .glass-corner-tl, .glass-corner-tr, .glass-corner-bl, .glass-corner-br {
          position: absolute; width: 30px; height: 30px;
          border-color: rgba(41,121,255,0.3);
          border-style: solid;
          pointer-events: none;
        }
        .glass-corner-tl { top: 15px; left: 15px; border-width: 1px 0 0 1px; }
        .glass-corner-tr { top: 15px; right: 15px; border-width: 1px 1px 0 0; }
        .glass-corner-bl { bottom: 15px; left: 15px; border-width: 0 0 1px 1px; }
        .glass-corner-br { bottom: 15px; right: 15px; border-width: 0 1px 1px 0; }

        /* Brand Icon */
        .brand-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .brand-icon-ring {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(41,121,255,0.2), rgba(92,159,255,0.1));
          border: 1px solid var(--glass-border-bright);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: ring-pulse 3s ease-in-out infinite;
        }

        .brand-icon-ring::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-vivid), transparent);
          opacity: 0.3;
          animation: ring-glow 2s ease-in-out infinite;
        }

        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes ring-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .brand-icon {
          font-size: 2.5rem;
          color: var(--white);
          text-shadow: 0 0 30px var(--blue-vivid);
          animation: icon-float 3s ease-in-out infinite;
        }

        @keyframes icon-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }

        /* Login Header */
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-title {
          display: flex; flex-direction: column;
          gap: 0.25rem;
        }

        .title-top {
          font-family: var(--font-display);
          font-size: 2.8rem;
          font-weight: 700;
          font-style: italic;
          color: var(--white);
          line-height: 1.1;
          letter-spacing: -0.02em;
          text-shadow: 0 0 40px rgba(255,255,255,0.2);
        }

        .title-bottom {
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 300;
          letter-spacing: 4px;
          text-transform: uppercase;
          background: linear-gradient(90deg, var(--blue-pale), var(--white), var(--blue-pale));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200%;
          animation: text-shimmer 5s ease-in-out infinite;
        }

        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Divider */
        .login-divider {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; margin-bottom: 2rem;
        }
        .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.4); }
        .divider-line { flex: 1; max-width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); }
        .divider-diamond { color: rgba(144,201,255,0.6); font-size: 0.8rem; }

        /* Error Alert */
        .error-alert {
          position: relative;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 20px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .error-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at center, rgba(239,68,68,0.2), transparent 70%);
          opacity: 0.5;
          animation: error-pulse 2s ease-in-out infinite;
        }

        @keyframes error-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .error-icon {
          font-size: 1.3rem;
          z-index: 1;
        }

        .error-text {
          color: #fecaca;
          font-weight: 600;
          font-size: 0.95rem;
          z-index: 1;
        }

        /* Login Form */
        .login-form {
          width: 100%;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          transition: all 0.3s var(--ease-out);
        }

        .field-hovered {
          transform: translateX(5px);
        }

        .form-label {
          color: var(--text-on-dark);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .label-icon {
          color: var(--blue-light);
          font-size: 1rem;
        }

        .input-wrapper {
          position: relative;
          width: 100%;
        }

        .form-input {
          width: 100%;
          padding: 1.2rem 1.8rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--white);
          transition: all 0.3s var(--ease-out);
          position: relative;
          z-index: 1;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--blue-vivid);
          background: rgba(255,255,255,0.08);
          box-shadow: 0 0 40px rgba(41,121,255,0.2);
        }

        .form-input::placeholder {
          color: rgba(255,255,255,0.3);
          font-style: italic;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-focus-ring {
          position: absolute; inset: -2px;
          border-radius: 32px;
          background: linear-gradient(135deg, var(--blue-vivid), var(--blue-light), transparent);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 0;
        }

        .form-input:focus + .input-focus-ring {
          opacity: 0.3;
        }

        .input-glow {
          position: absolute; inset: 0;
          border-radius: 30px;
          background: radial-gradient(circle at center, rgba(41,121,255,0.2), transparent 70%);
          opacity: 0.5;
          pointer-events: none;
          z-index: 2;
        }

        /* Submit Button */
        .submit-button {
          position: relative;
          width: 100%;
          padding: 1.2rem 2rem;
          border: none;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid), var(--blue-light));
          background-size: 200% 200%;
          color: var(--white);
          font-weight: 800;
          font-size: 1.1rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.4s var(--ease-out);
          box-shadow: 0 20px 40px rgba(41,121,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          overflow: hidden;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 30px 50px rgba(41,121,255,0.4);
          background-position: 100% 0;
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-glow {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .submit-button:hover .button-glow {
          transform: translateX(100%);
        }

        .button-icon {
          font-size: 1.3rem;
          color: rgba(255,255,255,0.9);
          z-index: 1;
        }

        .button-text {
          z-index: 1;
        }

        .button-arrow {
          transition: transform 0.3s var(--ease-spring);
          z-index: 1;
        }

        .submit-button:hover .button-arrow {
          transform: translateX(5px);
        }

        .loading-spinner {
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Login Links */
        .login-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .link-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          text-decoration: none;
          color: var(--text-muted-dark);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s var(--ease-out);
          overflow: hidden;
        }

        .link-item:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--blue-light);
          color: var(--white);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(41,121,255,0.2);
        }

        .link-icon {
          font-size: 1.1rem;
          color: var(--blue-light);
          transition: transform 0.3s var(--ease-spring);
        }

        .link-item:hover .link-icon {
          transform: scale(1.2) rotate(5deg);
        }

        .link-text {
          flex: 1;
        }

        .link-arrow {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s var(--ease-out);
        }

        .link-item:hover .link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .link-badge {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.2rem 0.8rem;
          border-radius: 30px;
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
          color: var(--white);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(41,121,255,0.3);
        }

        .admin-link {
          background: linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,165,0,0.05));
          border-color: rgba(255,165,0,0.3);
        }

        .admin-link:hover {
          background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.1));
          border-color: #fbbf24;
        }

        /* Security Badge */
        .security-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 1.8rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          backdrop-filter: blur(10px);
        }

        .security-shield {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shield-icon {
          font-size: 1.8rem;
          position: relative;
          z-index: 1;
          animation: shield-pulse 3s ease-in-out infinite;
        }

        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .shield-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(41,121,255,0.3);
          animation: ring-spin 4s linear infinite;
        }

        @keyframes ring-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .security-text {
          display: flex;
          flex-direction: column;
        }

        .security-main {
          color: var(--white);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }

        .security-sub {
          color: var(--text-muted-dark);
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-glass {
            padding: 2.5rem 2rem;
          }

          .title-top {
            font-size: 2.4rem;
          }

          .title-bottom {
            font-size: 0.9rem;
            letter-spacing: 3px;
          }

          .brand-icon-ring {
            width: 70px;
            height: 70px;
          }

          .brand-icon {
            font-size: 2.2rem;
          }

          .form-input {
            padding: 1rem 1.5rem;
          }

          .submit-button {
            padding: 1rem 1.8rem;
            font-size: 1rem;
          }

          .security-badge {
            padding: 1rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .login-glass {
            padding: 2rem 1.5rem;
            border-radius: 36px;
          }

          .title-top {
            font-size: 2rem;
          }

          .title-bottom {
            font-size: 0.8rem;
            letter-spacing: 2px;
          }

          .brand-icon-ring {
            width: 60px;
            height: 60px;
          }

          .brand-icon {
            font-size: 1.8rem;
          }

          .form-input {
            padding: 0.9rem 1.2rem;
            font-size: 0.95rem;
          }

          .form-label {
            font-size: 0.85rem;
          }

          .submit-button {
            padding: 0.9rem 1.5rem;
            font-size: 0.95rem;
          }

          .link-item {
            padding: 0.8rem 1.2rem;
            font-size: 0.85rem;
          }

          .security-badge {
            padding: 0.8rem 1.2rem;
          }

          .security-main {
            font-size: 0.8rem;
          }

          .security-sub {
            font-size: 0.7rem;
          }

          .glass-corner-tl, .glass-corner-tr, .glass-corner-bl, .glass-corner-br {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 360px) {
          .login-glass {
            padding: 1.5rem 1rem;
          }

          .title-top {
            font-size: 1.8rem;
          }

          .brand-icon-ring {
            width: 50px;
            height: 50px;
          }

          .brand-icon {
            font-size: 1.5rem;
          }

          .form-input {
            padding: 0.8rem 1rem;
          }

          .submit-button {
            padding: 0.8rem 1.2rem;
            font-size: 0.85rem;
          }

          .link-item {
            padding: 0.7rem 1rem;
            font-size: 0.8rem;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}