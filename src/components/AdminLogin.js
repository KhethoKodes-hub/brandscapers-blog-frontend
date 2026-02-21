// client/src/components/AdminLogin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../firebase';
import API from '../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [hoveredField, setHoveredField] = useState(null);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Show warning modal on initial load (unless dismissed)
    if (!warningDismissed) {
      setShowWarning(true);
    }
  }, [warningDismissed]);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add a slight delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Save Firebase ID token to localStorage for API calls
      localStorage.setItem('token', idToken);

      // ✅ NEW: store role so NavBar knows this is an admin
      localStorage.setItem('role', 'admin');

      // Trigger the unlock animation
      document.body.classList.add('admin-unlock-effect');
      
      // Wait for animation to complete before navigating
      setTimeout(() => {
        // Success notification
        const notification = document.createElement('div');
        notification.className = 'access-granted-notification';
        notification.innerHTML = `
          <div class="notification-content">
            <span class="notification-icon">🔓</span>
            <div class="notification-text">
              <strong>ACCESS GRANTED</strong>
              <span>Welcome back, Administrator</span>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
            nav('/admin');
          }, 300);
        }, 2800);
      }, 1800);
      
    } catch (err) {
      console.error(err);
      setShakeEffect(true);
      setTimeout(() => setShakeEffect(false), 500);
      
      // Show denied notification
      const notification = document.createElement('div');
      notification.className = 'access-denied-notification';
      notification.innerHTML = `
        <div class="notification-content denied">
          <span class="notification-icon">⚠️</span>
          <div class="notification-text">
            <strong>ACCESS DENIED</strong>
            <span>Invalid credentials detected</span>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
      }, 100);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissWarning = () => {
    setShowWarning(false);
    setWarningDismissed(true);
  };

  return (
    <div className="admin-login-root">
      {/* Layered animated background - matching home page */}
      <div className="bg-base" />
      <div className="bg-noise" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-lines" />

      {/* Security Warning Modal */}
      {showWarning && (
        <div className="warning-modal">
          <div className="warning-modal-content">
            <div className="warning-icon-container">
              <div className="warning-icon-ring">
                <span className="warning-icon">⚠️</span>
              </div>
            </div>
            
            <h2 className="warning-title">SECURITY NOTICE</h2>
            
            <div className="warning-divider">
              <span className="warning-divider-dot" />
              <span className="warning-divider-line" />
              <span className="warning-divider-diamond">◇</span>
              <span className="warning-divider-line" />
              <span className="warning-divider-dot" />
            </div>

            <div className="warning-message">
              <p className="warning-text">
                <strong>WARNING:</strong> This is a restricted administrative portal.
                Unauthorized access attempts are strictly prohibited and will be:
              </p>
              
              <ul className="warning-list">
                <li className="warning-list-item">
                  <span className="list-icon">◉</span>
                  <span>Logged and traced to your IP address</span>
                </li>
                <li className="warning-list-item">
                  <span className="list-icon">◈</span>
                  <span>Reported to security authorities</span>
                </li>
                <li className="warning-list-item">
                  <span className="list-icon">✦</span>
                  <span>Subject to legal prosecution</span>
                </li>
                <li className="warning-list-item">
                  <span className="list-icon">⚡</span>
                  <span>Permanently blacklisted from all services</span>
                </li>
              </ul>

              <p className="warning-footer">
                By proceeding, you confirm that you are an authorized administrator
                and accept full responsibility for your actions.
              </p>
            </div>

            <div className="warning-actions">
              <button className="warning-button proceed" onClick={dismissWarning}>
                <span className="button-glow" />
                <span className="button-icon">⚡</span>
                <span>I AM AN AUTHORIZED ADMINISTRATOR</span>
                <span className="button-arrow">→</span>
              </button>
              <button className="warning-button exit" onClick={() => window.location.href = '/'}>
                <span className="button-icon">✕</span>
                <span>EXIT IMMEDIATELY</span>
              </button>
            </div>

            <div className="warning-corner-tl" />
            <div className="warning-corner-tr" />
            <div className="warning-corner-bl" />
            <div className="warning-corner-br" />
          </div>
        </div>
      )}

      <div className="admin-login-container">
        <div className="admin-login-wrapper">
          {/* Hero Glass Card */}
          <div className={`admin-login-glass ${shakeEffect ? 'shake' : ''}`}>
            <div className="glass-top-line" />
            
            {/* Lock Icon with Animation */}
            <div className="lock-icon-wrapper">
              <div className="lock-icon-ring">
                <span className="lock-icon">🔐</span>
                <div className="lock-shards">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`shard shard-${i + 1}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Login Header */}
            <div className="admin-login-header">
              <h1 className="admin-login-title">
                <span className="title-top">ADMIN SANCTUM</span>
                <span className="title-bottom">Executive Access Portal</span>
              </h1>
            </div>

            {/* Security Badge Strip */}
            <div className="security-badge-strip">
              <span className="security-badge-icon">🛡️</span>
              <span className="security-badge-text">QUANTUM ENCRYPTED • TIER 9 CLEARANCE</span>
              <span className="security-badge-icon">⚡</span>
            </div>

            {/* Decorative Divider */}
            <div className="admin-login-divider">
              <span className="divider-dot" />
              <span className="divider-line" />
              <span className="divider-diamond">◇</span>
              <span className="divider-line" />
              <span className="divider-dot" />
            </div>

            {/* Warning Message */}
            <div className="admin-warning-message">
              <span className="warning-message-icon">⚠️</span>
              <span className="warning-message-text">
                Unauthorized access attempts are monitored and subject to legal action
              </span>
            </div>

            {/* Admin Login Form */}
            <form onSubmit={submit} className="admin-login-form">
              <div 
                className={`form-group ${hoveredField === 'email' ? 'field-hovered' : ''}`}
                onMouseEnter={() => setHoveredField('email')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="form-label">
                  <span className="label-icon">⚡</span>
                  ADMIN IDENTIFIER
                </label>
                <div className="input-wrapper">
                  <input 
                    type="email" 
                    placeholder="admin@brandscapers.africa" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="form-input"
                    disabled={isSubmitting}
                  />
                  <div className="input-focus-ring" />
                  {hoveredField === 'email' && <span className="input-glow" />}
                  <div className="input-crystal-effect" />
                </div>
              </div>

              <div 
                className={`form-group ${hoveredField === 'password' ? 'field-hovered' : ''}`}
                onMouseEnter={() => setHoveredField('password')}
                onMouseLeave={() => setHoveredField(null)}
              >
                <label className="form-label">
                  <span className="label-icon">🔑</span>
                  CRYPTIC CIPHER
                </label>
                <div className="input-wrapper">
                  <input 
                    type="password" 
                    placeholder="••••••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="form-input"
                    disabled={isSubmitting}
                  />
                  <div className="input-focus-ring" />
                  {hoveredField === 'password' && <span className="input-glow" />}
                  <div className="input-crystal-effect" />
                </div>
              </div>

              {/* Security Clearance Indicator */}
              <div className="clearance-indicator">
                <div className="clearance-bars">
                  <div className={`clearance-bar ${email && password ? 'active' : ''}`} />
                  <div className={`clearance-bar ${email && password ? 'active' : ''}`} />
                  <div className={`clearance-bar ${email && password ? 'active' : ''}`} />
                </div>
                <span className="clearance-text">
                  {email && password ? 'CLEARANCE VERIFIED' : 'AWAITING CREDENTIALS'}
                </span>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={!email.trim() || !password.trim() || isSubmitting}
              >
                <span className="button-glow" />
                <span className="button-icon">
                  {isSubmitting ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    '⚡'
                  )}
                </span>
                <span className="button-text">
                  {isSubmitting ? 'DECRYPTING...' : 'INITIATE ACCESS SEQUENCE'}
                </span>
                <span className="button-arrow">→</span>
              </button>
            </form>

            {/* Security Metadata */}
            <div className="security-metadata">
              <div className="metadata-item">
                <span className="metadata-label">SESSION:</span>
                <span className="metadata-value">ENCRYPTED</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">PROTOCOL:</span>
                <span className="metadata-value">TLS 1.3</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">AUDIT:</span>
                <span className="metadata-value">ACTIVE</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="security-badge">
              <div className="security-shield">
                <span className="shield-icon">🛡️</span>
                <div className="shield-ring" />
              </div>
              <div className="security-text">
                <span className="security-main">QUANTUM-ENCRYPTED ACCESS PORTAL</span>
                <span className="security-sub">TIER 9 CLEARANCE REQUIRED • ALL ATTEMPTS LOGGED</span>
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
        .admin-login-root {
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

        /* ── WARNING MODAL ── */
        .warning-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(20px);
          animation: modal-fade-in 0.5s var(--ease-out);
        }

        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .warning-modal-content {
          position: relative;
          max-width: 600px;
          width: 100%;
          background: linear-gradient(135deg, rgba(20,20,30,0.95), rgba(10,10,20,0.98));
          backdrop-filter: blur(60px);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 48px;
          padding: 3rem;
          box-shadow: 0 40px 100px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
          overflow: hidden;
        }

        .warning-corner-tl, .warning-corner-tr, .warning-corner-bl, .warning-corner-br {
          position: absolute; width: 30px; height: 30px;
          border-color: rgba(239,68,68,0.3);
          border-style: solid;
          pointer-events: none;
        }
        .warning-corner-tl { top: 15px; left: 15px; border-width: 1px 0 0 1px; }
        .warning-corner-tr { top: 15px; right: 15px; border-width: 1px 1px 0 0; }
        .warning-corner-bl { bottom: 15px; left: 15px; border-width: 0 0 1px 1px; }
        .warning-corner-br { bottom: 15px; right: 15px; border-width: 0 1px 1px 0; }

        .warning-icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .warning-icon-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: warning-pulse 2s ease-in-out infinite;
        }

        .warning-icon-ring::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239,68,68,0.2), transparent 70%);
          animation: warning-glow 2s ease-in-out infinite;
        }

        @keyframes warning-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes warning-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        .warning-icon {
          font-size: 3rem;
          animation: warning-float 3s ease-in-out infinite;
        }

        @keyframes warning-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .warning-title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 700;
          font-style: italic;
          color: #ef4444;
          text-align: center;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(239,68,68,0.3);
        }

        .warning-divider {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; margin-bottom: 2rem;
        }
        .warning-divider-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(239,68,68,0.4); }
        .warning-divider-line { flex: 1; max-width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(239,68,68,0.3), transparent); }
        .warning-divider-diamond { color: rgba(239,68,68,0.4); font-size: 0.8rem; }

        .warning-message {
          margin-bottom: 2rem;
        }

        .warning-text {
          color: #fecaca;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .warning-list {
          list-style: none;
          padding: 0;
          margin-bottom: 1.5rem;
        }

        .warning-list-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-bottom: 1px solid rgba(239,68,68,0.1);
          color: #fca5a5;
        }

        .list-icon {
          color: #ef4444;
          font-size: 1rem;
        }

        .warning-footer {
          color: #fecaca;
          font-size: 0.95rem;
          font-style: italic;
          padding: 1rem;
          background: rgba(239,68,68,0.05);
          border-radius: 16px;
          border-left: 3px solid #ef4444;
        }

        .warning-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .warning-button {
          position: relative;
          padding: 1rem 2rem;
          border: none;
          border-radius: 40px;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          overflow: hidden;
        }

        .warning-button.proceed {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          box-shadow: 0 10px 30px rgba(16,185,129,0.3);
        }

        .warning-button.proceed:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(16,185,129,0.4);
        }

        .warning-button.exit {
          background: transparent;
          border: 1px solid rgba(239,68,68,0.3);
          color: #ef4444;
        }

        .warning-button.exit:hover {
          background: rgba(239,68,68,0.1);
          border-color: #ef4444;
        }

        /* ── ADMIN LOGIN CONTAINER ── */
        .admin-login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 550px;
          margin: 2rem auto;
          padding: 0 1.5rem;
        }

        .admin-login-wrapper {
          width: 100%;
        }

        /* ── ADMIN LOGIN GLASS CARD ── */
        .admin-login-glass {
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

        .admin-login-glass.shake {
          animation: shake 0.5s var(--ease-out);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
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

        /* Lock Icon */
        .lock-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .lock-icon-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(41,121,255,0.2), rgba(92,159,255,0.1));
          border: 1px solid var(--glass-border-bright);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: ring-pulse 3s ease-in-out infinite;
        }

        .lock-icon-ring::before {
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

        .lock-icon {
          font-size: 3rem;
          color: var(--white);
          text-shadow: 0 0 30px var(--blue-vivid);
          animation: icon-float 3s ease-in-out infinite;
        }

        @keyframes icon-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }

        /* Lock Shards Animation */
        .lock-shards {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .shard {
          position: absolute;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(66,165,245,0.8) 100%);
          border-radius: 4px;
          opacity: 0;
        }

        .admin-unlock-effect .shard {
          animation: shard-explode 1.5s ease-out forwards;
        }

        @keyframes shard-explode {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(var(--x) * 200px),
              calc(var(--y) * 200px)
            ) rotate(720deg) scale(0);
          }
        }

        .shard-1 { --x: -1; --y: -1; top: 30%; left: 30%; }
        .shard-2 { --x: 1; --y: -1; top: 30%; right: 30%; }
        .shard-3 { --x: -1; --y: 1; bottom: 30%; left: 30%; }
        .shard-4 { --x: 1; --y: 1; bottom: 30%; right: 30%; }
        .shard-5 { --x: -0.5; --y: -1.5; top: 20%; left: 40%; }
        .shard-6 { --x: 1.5; --y: -0.5; top: 40%; right: 20%; }
        .shard-7 { --x: -1.5; --y: 0.5; bottom: 40%; left: 20%; }
        .shard-8 { --x: 0.5; --y: 1.5; bottom: 20%; right: 40%; }

        /* Admin Login Header */
        .admin-login-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .admin-login-title {
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

        /* Security Badge Strip */
        .security-badge-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 40px;
        }

        .security-badge-icon {
          color: var(--blue-light);
          font-size: 1rem;
        }

        .security-badge-text {
          color: var(--text-muted-dark);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 2px;
        }

        /* Divider */
        .admin-login-divider {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; margin-bottom: 1.5rem;
        }
        .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.4); }
        .divider-line { flex: 1; max-width: 60px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); }
        .divider-diamond { color: rgba(144,201,255,0.6); font-size: 0.8rem; }

        /* Admin Warning Message */
        .admin-warning-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding: 0.75rem 1rem;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 40px;
        }

        .warning-message-icon {
          color: #ef4444;
          font-size: 1rem;
        }

        .warning-message-text {
          color: #fecaca;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Admin Login Form */
        .admin-login-form {
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
          font-size: 0.8rem;
          letter-spacing: 2px;
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
          border-radius: 40px;
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
          letter-spacing: 1px;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-focus-ring {
          position: absolute; inset: -2px;
          border-radius: 42px;
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
          border-radius: 40px;
          background: radial-gradient(circle at center, rgba(41,121,255,0.2), transparent 70%);
          opacity: 0.5;
          pointer-events: none;
          z-index: 2;
        }

        .input-crystal-effect {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255,255,255,0.1) 50%,
            transparent 70%
          );
          transform: rotate(45deg);
          transition: transform 0.6s ease;
          pointer-events: none;
          z-index: 3;
        }

        .form-input:focus ~ .input-crystal-effect {
          transform: rotate(45deg) translate(50%, 50%);
        }

        /* Clearance Indicator */
        .clearance-indicator {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .clearance-bars {
          display: flex;
          gap: 0.25rem;
          flex: 1;
        }

        .clearance-bar {
          height: 4px;
          flex: 1;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .clearance-bar.active {
          background: linear-gradient(90deg, var(--blue-light), var(--blue-vivid));
          box-shadow: 0 0 10px var(--blue-vivid);
        }

        .clearance-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted-dark);
          min-width: 140px;
          text-align: right;
          letter-spacing: 1px;
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
          font-size: 1rem;
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
          opacity: 0.6;
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

        /* Security Metadata */
        .security-metadata {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 40px;
        }

        .metadata-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .metadata-label {
          color: var(--text-muted-dark);
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .metadata-value {
          color: var(--blue-light);
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* Security Badge */
        .security-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 1.8rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 40px;
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
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }

        .security-sub {
          color: var(--text-muted-dark);
          font-size: 0.65rem;
          font-weight: 500;
        }

        /* Notifications */
        .access-granted-notification,
        .access-denied-notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 10000;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s var(--ease-out);
        }

        .access-granted-notification.show,
        .access-denied-notification.show {
          opacity: 1;
          transform: translateX(0);
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem 2rem;
          background: linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95));
          backdrop-filter: blur(20px);
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .notification-content.denied {
          background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95));
        }

        .notification-icon {
          font-size: 2rem;
        }

        .notification-text {
          display: flex;
          flex-direction: column;
        }

        .notification-text strong {
          color: white;
          font-size: 1.1rem;
        }

        .notification-text span {
          color: rgba(255,255,255,0.9);
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-login-glass {
            padding: 2.5rem 2rem;
          }

          .title-top {
            font-size: 2.4rem;
          }

          .title-bottom {
            font-size: 0.9rem;
            letter-spacing: 3px;
          }

          .lock-icon-ring {
            width: 80px;
            height: 80px;
          }

          .lock-icon {
            font-size: 2.5rem;
          }

          .form-input {
            padding: 1rem 1.5rem;
          }

          .submit-button {
            padding: 1rem 1.8rem;
            font-size: 0.95rem;
          }

          .security-badge {
            padding: 1rem 1.5rem;
          }

          .warning-modal-content {
            padding: 2rem;
          }

          .warning-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .admin-login-glass {
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

          .lock-icon-ring {
            width: 70px;
            height: 70px;
          }

          .lock-icon {
            font-size: 2.2rem;
          }

          .form-input {
            padding: 0.9rem 1.2rem;
            font-size: 0.95rem;
          }

          .form-label {
            font-size: 0.75rem;
          }

          .submit-button {
            padding: 0.9rem 1.5rem;
            font-size: 0.85rem;
          }

          .security-metadata {
            flex-direction: column;
            gap: 0.5rem;
          }

          .metadata-item {
            flex-direction: row;
            justify-content: space-between;
          }

          .security-badge {
            padding: 0.8rem 1.2rem;
          }

          .security-main {
            font-size: 0.75rem;
          }

          .security-sub {
            font-size: 0.6rem;
          }

          .glass-corner-tl, .glass-corner-tr, .glass-corner-bl, .glass-corner-br {
            width: 20px;
            height: 20px;
          }

          .clearance-indicator {
            flex-direction: column;
            gap: 0.5rem;
          }

          .clearance-text {
            text-align: center;
            min-width: auto;
          }

          .warning-modal-content {
            padding: 1.5rem;
          }

          .warning-title {
            font-size: 1.8rem;
          }

          .warning-list-item {
            font-size: 0.85rem;
          }

          .warning-button {
            padding: 0.8rem 1.5rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          .admin-login-glass {
            padding: 1.5rem 1rem;
          }

          .title-top {
            font-size: 1.8rem;
          }

          .lock-icon-ring {
            width: 60px;
            height: 60px;
          }

          .lock-icon {
            font-size: 1.8rem;
          }

          .form-input {
            padding: 0.8rem 1rem;
          }

          .submit-button {
            padding: 0.8rem 1.2rem;
            font-size: 0.8rem;
          }

          .security-badge-strip {
            flex-wrap: wrap;
          }

          .security-badge-text {
            font-size: 0.6rem;
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