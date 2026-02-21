// client/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredField, setHoveredField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[a-z]+/)) strength += 25;
    if (pass.match(/[A-Z]+/)) strength += 25;
    if (pass.match(/[0-9]+/)) strength += 25;
    if (pass.match(/[$@#&!]+/)) strength += 25;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }

    try {
      // 1️⃣ Sign up with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Get Firebase ID token
      const token = await user.getIdToken(true);

      // 3️⃣ Save token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.uid);

      // 4️⃣ Success feedback
      setSuccess('🎉 Registration successful! Welcome to our community.');

      // 5️⃣ Redirect after 2 seconds
      setTimeout(() => {
        navigate('/'); // home page
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message.includes('auth/email-already-in-use') 
        ? 'This email is already registered. Please try logging in.'
        : 'Registration failed. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-root">
      {/* Layered animated background - matching home page */}
      <div className="bg-base" />
      <div className="bg-noise" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-lines" />

      <div className="register-container">
        <div className="register-wrapper">
          {/* Hero Glass Card */}
          <div className="register-glass">
            <div className="glass-top-line" />
            
            {/* Brand Icon */}
            <div className="brand-icon-wrapper">
              <div className="brand-icon-ring">
                <span className="brand-icon">✦</span>
              </div>
            </div>

            {/* Register Header */}
            <div className="register-header">
              <h1 className="register-title">
                <span className="title-top">Start Your Journey</span>
                <span className="title-bottom">Create your account</span>
              </h1>
            </div>

            {/* Decorative Divider */}
            <div className="register-divider">
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

            {/* Success Message */}
            {success && (
              <div className="success-alert">
                <span className="success-icon">✓</span>
                <span className="success-text">{success}</span>
                <div className="success-glow" />
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="register-form">
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
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="form-input"
                    disabled={isLoading || success}
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
                    placeholder="Create a strong password" 
                    value={password} 
                    onChange={handlePasswordChange} 
                    required 
                    className="form-input"
                    disabled={isLoading || success}
                  />
                  <div className="input-focus-ring" />
                  {hoveredField === 'password' && <span className="input-glow" />}
                </div>
                
                {/* Password Strength Meter */}
                {password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      <div className={`strength-bar ${passwordStrength >= 25 ? 'active' : ''}`} />
                      <div className={`strength-bar ${passwordStrength >= 50 ? 'active' : ''}`} />
                      <div className={`strength-bar ${passwordStrength >= 75 ? 'active' : ''}`} />
                      <div className={`strength-bar ${passwordStrength >= 100 ? 'active' : ''}`} />
                    </div>
                    <span className="strength-text">
                      {passwordStrength < 25 && 'Weak'}
                      {passwordStrength >= 25 && passwordStrength < 50 && 'Fair'}
                      {passwordStrength >= 50 && passwordStrength < 75 && 'Good'}
                      {passwordStrength >= 75 && passwordStrength < 100 && 'Strong'}
                      {passwordStrength >= 100 && 'Very Strong'}
                    </span>
                  </div>
                )}

                {/* Password Hint */}
                <div className="password-hint">
                  <span className="hint-icon">✦</span>
                  <span className="hint-text">Use at least 8 characters with letters, numbers & symbols</span>
                </div>
              </div>

              <div 
                className={`form-group ${hoveredField === 'confirm' ? 'field-hovered' : ''}`}
                onMouseEnter={() => setHoveredField('confirm')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="form-label">
                  <span className="label-icon">◈</span>
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="Re-enter your password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    className="form-input"
                    disabled={isLoading || success}
                  />
                  <div className="input-focus-ring" />
                  {hoveredField === 'confirm' && <span className="input-glow" />}
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="password-match">
                    {password === confirmPassword ? (
                      <span className="match-success">
                        <span className="match-icon">✓</span>
                        Passwords match
                      </span>
                    ) : (
                      <span className="match-error">
                        <span className="match-icon">✗</span>
                        Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="terms-section">
                <div className="terms-checkbox-wrapper">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="terms-checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    disabled={isLoading || success}
                  />
                  <label htmlFor="terms" className="terms-checkbox-label">
                    <span className="checkbox-custom">
                      {acceptedTerms && <span className="checkbox-icon">✓</span>}
                    </span>
                  </label>
                </div>
                <div className="terms-text">
                  <span className="terms-main">I agree to the </span>
                  <Link to="/terms" className="terms-link">Terms of Service</Link>
                  <span className="terms-main"> and </span>
                  <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isLoading || success}
              >
                <span className="button-glow" />
                <span className="button-icon">
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : success ? (
                    '✓'
                  ) : (
                    '✦'
                  )}
                </span>
                <span className="button-text">
                  {isLoading ? 'Creating Account...' : success ? 'Success! Redirecting...' : 'Create Account'}
                </span>
                <span className="button-arrow">→</span>
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <span className="divider-line" />
              <span className="divider-diamond">◇</span>
              <span className="divider-line" />
            </div>

            {/* Login Redirect */}
            <div className="login-redirect-section">
              <Link to="/login" className="login-redirect-button">
                <span className="redirect-icon">◈</span>
                <span className="redirect-text">Already have an account? Sign In</span>
                <span className="redirect-arrow">→</span>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="feature-highlights">
              <h3 className="features-title">
                <span className="features-icon">✦</span>
                What you'll get:
              </h3>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">⭐</span>
                  </div>
                  <span className="feature-text">Premium content access</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">💾</span>
                  </div>
                  <span className="feature-text">Save & bookmark posts</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">👥</span>
                  </div>
                  <span className="feature-text">Join the community</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <span className="feature-icon">🔔</span>
                  </div>
                  <span className="feature-text">Personalized notifications</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <div className="security-shield">
                <span className="shield-icon">🛡️</span>
                <div className="shield-ring" />
              </div>
              <div className="security-text">
                <span className="security-main">Enterprise-grade security</span>
                <span className="security-sub">Powered by Firebase Authentication</span>
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
        .register-root {
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

        /* ── REGISTER CONTAINER ── */
        .register-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 550px;
          margin: 2rem auto;
          padding: 0 1.5rem;
        }

        .register-wrapper {
          width: 100%;
        }

        /* ── REGISTER GLASS CARD ── */
        .register-glass {
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

        /* Register Header */
        .register-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .register-title {
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
        .register-divider {
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

        /* Success Alert */
        .success-alert {
          position: relative;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 20px;
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
          overflow: hidden;
        }

        .success-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at center, rgba(16,185,129,0.2), transparent 70%);
          opacity: 0.5;
          animation: success-pulse 2s ease-in-out infinite;
        }

        @keyframes success-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .success-icon {
          font-size: 1.3rem;
          z-index: 1;
          color: #10b981;
        }

        .success-text {
          color: #a7f3d0;
          font-weight: 600;
          font-size: 0.95rem;
          z-index: 1;
        }

        /* Register Form */
        .register-form {
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

        /* Password Strength Meter */
        .password-strength {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .strength-bars {
          display: flex;
          gap: 0.25rem;
          flex: 1;
        }

        .strength-bar {
          height: 4px;
          flex: 1;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-bar.active {
          background: linear-gradient(90deg, var(--blue-light), var(--blue-vivid));
          box-shadow: 0 0 10px var(--blue-vivid);
        }

        .strength-bar:nth-child(1).active { background: #ef4444; }
        .strength-bar:nth-child(2).active { background: #f59e0b; }
        .strength-bar:nth-child(3).active { background: #10b981; }
        .strength-bar:nth-child(4).active { background: #3b82f6; }

        .strength-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted-dark);
          min-width: 70px;
          text-align: right;
        }

        /* Password Hint */
        .password-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border-left: 3px solid var(--blue-light);
        }

        .hint-icon {
          font-size: 0.9rem;
          color: var(--blue-light);
        }

        .hint-text {
          color: var(--text-muted-dark);
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Password Match Indicator */
        .password-match {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .match-success {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .match-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .match-icon {
          font-size: 1rem;
        }

        /* Terms Section */
        .terms-section {
          margin: 2rem 0;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .terms-checkbox-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .terms-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .terms-checkbox-label {
          display: block;
          cursor: pointer;
        }

        .checkbox-custom {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          transition: all 0.3s var(--ease-out);
        }

        .terms-checkbox:checked + .terms-checkbox-label .checkbox-custom {
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
          border-color: transparent;
        }

        .terms-checkbox:focus + .terms-checkbox-label .checkbox-custom {
          box-shadow: 0 0 0 3px rgba(41,121,255,0.3);
        }

        .checkbox-icon {
          color: white;
          font-size: 0.9rem;
        }

        .terms-text {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.3rem;
          color: var(--text-muted-dark);
          font-size: 0.9rem;
        }

        .terms-main {
          color: var(--text-muted-dark);
        }

        .terms-link {
          color: var(--blue-light);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }

        .terms-link:hover {
          color: var(--white);
        }

        .terms-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--blue-light);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .terms-link:hover::after {
          transform: scaleX(1);
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

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin: 2rem 0;
        }

        .divider-line {
          flex: 1;
          max-width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .divider-diamond {
          color: rgba(144,201,255,0.4);
          font-size: 0.8rem;
        }

        /* Login Redirect */
        .login-redirect-section {
          margin-bottom: 2rem;
        }

        .login-redirect-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 40px;
          text-decoration: none;
          color: var(--text-muted-dark);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s var(--ease-out);
          overflow: hidden;
          position: relative;
        }

        .login-redirect-button:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--blue-light);
          color: var(--white);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(41,121,255,0.2);
        }

        .redirect-icon {
          font-size: 1.1rem;
          color: var(--blue-light);
          transition: transform 0.3s var(--ease-spring);
        }

        .login-redirect-button:hover .redirect-icon {
          transform: scale(1.2) rotate(5deg);
        }

        .redirect-text {
          flex: 1;
        }

        .redirect-arrow {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s var(--ease-out);
        }

        .login-redirect-button:hover .redirect-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* Feature Highlights */
        .feature-highlights {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          backdrop-filter: blur(10px);
        }

        .features-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 1.5rem;
          text-align: center;
          justify-content: center;
        }

        .features-icon {
          color: var(--blue-light);
          font-size: 1.2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          transition: all 0.3s var(--ease-out);
        }

        .feature-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--blue-light);
          transform: translateY(-2px);
        }

        .feature-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(41,121,255,0.1);
          border-radius: 10px;
        }

        .feature-icon {
          font-size: 1.1rem;
          color: var(--blue-light);
        }

        .feature-text {
          color: var(--text-muted-dark);
          font-size: 0.85rem;
          font-weight: 500;
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
          .register-glass {
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

          .features-grid {
            grid-template-columns: 1fr;
          }

          .security-badge {
            padding: 1rem 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .register-glass {
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

          .feature-item {
            padding: 0.6rem;
          }

          .feature-text {
            font-size: 0.8rem;
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

          .password-strength {
            flex-direction: column;
            gap: 0.5rem;
          }

          .strength-text {
            text-align: left;
            align-self: flex-start;
          }

          .terms-text {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 360px) {
          .register-glass {
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

          .feature-icon-wrapper {
            width: 28px;
            height: 28px;
          }

          .feature-icon {
            font-size: 0.9rem;
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
};

export default Register;