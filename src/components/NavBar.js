import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// ── Inline SVG Logo ────────────────────────────────────────────────────────────
function BrandscapersLogo() {
  return (
    <svg viewBox="0 0 230 54" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="nbHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1338be" />
          <stop offset="100%" stopColor="#2979ff" />
        </linearGradient>
        <linearGradient id="nbTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="55%"  stopColor="#e3f2fd" />
          <stop offset="100%" stopColor="#90c9ff" />
        </linearGradient>
        <linearGradient id="nbSubGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#5c9fff" />
          <stop offset="100%" stopColor="#90c9ff" />
        </linearGradient>
        <filter id="nbHexGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="glow" />
          <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Hexagon mark ── */}
      <polygon
        points="24,2 43,13 43,35 24,46 5,35 5,13"
        fill="url(#nbHexGrad)"
        filter="url(#nbHexGlow)"
      />
      {/* Inner decorative hex ring */}
      <polygon
        points="24,9 36,16 36,30 24,37 12,30 12,16"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
      />
      {/* B letterform */}
      <text
        x="24" y="32"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontWeight="700"
        fontSize="20"
        fill="white"
      >B</text>

      {/* Accent dots orbiting the hex */}
      <circle cx="44" cy="11" r="2.8" fill="#90c9ff" opacity="0.85"/>
      <circle cx="4"  cy="37" r="2.2" fill="#5c9fff" opacity="0.7"/>
      <circle cx="44" cy="37" r="1.6" fill="#2979ff" opacity="0.8"/>

      {/* Vertical divider */}
      <line x1="51" y1="10" x2="51" y2="43" stroke="rgba(41,121,255,0.25)" strokeWidth="1"/>

      {/* ── Brand name ── */}
      <text
        x="59" y="29"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontWeight="700"
        fontSize="23"
        fill="url(#nbTextGrad)"
        letterSpacing="-0.5"
      >Brandscapers</text>

      {/* AFRICA sub-label */}
      <text
        x="60" y="42"
        fontFamily="'Outfit', system-ui, sans-serif"
        fontWeight="800"
        fontSize="7.5"
        fill="url(#nbSubGrad)"
        letterSpacing="5.5"
        opacity="0.75"
      >AFRICA</text>
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function NavBar() {
  const [scrolled, setScrolled]             = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const location = useLocation();

  const logged = !!localStorage.getItem('token');
  const role   = localStorage.getItem('role');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (e) => {
      if (loginDropdownOpen && !e.target.closest('.login-dropdown-container'))
        setLoginDropdownOpen(false);
    };
    document.addEventListener('click', onOutside);
    return () => document.removeEventListener('click', onOutside);
  }, [loginDropdownOpen]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <>
      <style>{CSS}</style>

      <nav className={`nb-nav${scrolled ? ' nb-scrolled' : ''}`}>
        {/* shimmer accent line */}
        <div className="nb-shimmer-line" />

        <div className="nb-container">

          {/* ── LOGO → brandscapersafrica.com ── */}
          <a
            href="https://www.brandscapersafrica.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nb-brand"
            title="Visit Brandscapers Africa"
          >
            <div className="nb-svg-wrap">
              <BrandscapersLogo />
            </div>
            <div className="nb-brand-halo" />
          </a>

          {/* ── NAV LINKS ── */}
          <div className={`nb-drawer${mobileMenuOpen ? ' nb-drawer-open' : ''}`}>
            {/* tap-outside to close on mobile */}
            <div className="nb-backdrop" onClick={() => setMobileMenuOpen(false)} />

            <div className="nb-drawer-inner">

              {/* mobile panel header */}
              <div className="nb-panel-head">
                <span className="nb-panel-eyebrow">Navigation</span>
                <button className="nb-panel-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>

              {/* Home */}
              <Link
                className={`nb-link${location.pathname === '/' ? ' nb-link-on' : ''}`}
                to="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nb-link-gem">◈</span>
                <span>Blog Home</span>
                <span className="nb-link-rail" />
              </Link>

              {/* Dashboard — admin only */}
              {logged && role === 'admin' && (
                <Link
                  className={`nb-link${location.pathname === '/admin' ? ' nb-link-on' : ''}`}
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nb-link-gem">⚡</span>
                  <span>Dashboard</span>
                  <span className="nb-badge">Admin</span>
                  <span className="nb-link-rail" />
                </Link>
              )}

              {/* =========================================== */}
              {/* ADMIN LOGIN BUTTON - CURRENTLY COMMENTED OUT */}
              {/* =========================================== */}

              {/* Admin login link if not logged in */}
              {/*
              {!logged && (
                <Link className={location.pathname === '/admin-login' ? 'active' : ''} to="/admin-login">
                  Admin Login
                </Link>
              )}
              */}

              {/* =========================================== */}
              {/* TO RE-ENABLE: Remove the comment markers above */}
              {/* =========================================== */}

              {/* Login dropdown — not logged in */}
              {!logged && (
                <div className="login-dropdown-container nb-dd-wrap">
                  <button
                    className={`nb-login-btn${loginDropdownOpen ? ' nb-login-open' : ''}${location.pathname === '/login' || location.pathname === '/register' ? ' nb-login-route' : ''}`}
                    onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  >
                    <span className="nb-link-gem">◉</span>
                    <span>Login</span>
                    <span className={`nb-chevron${loginDropdownOpen ? ' nb-chev-up' : ''}`}>›</span>
                    <span className="nb-sweep" />
                  </button>

                  {loginDropdownOpen && (
                    <div className="nb-dd-panel">
                      <div className="nb-dd-top-line" />
                      <Link
                        className={`nb-dd-item${location.pathname === '/login' ? ' nb-dd-on' : ''}`}
                        to="/login"
                        onClick={() => { setLoginDropdownOpen(false); setMobileMenuOpen(false); }}
                      >
                        <span className="nb-dd-arrow">→</span>
                        Sign In
                      </Link>
                      <div className="nb-dd-rule" />
                      <Link
                        className={`nb-dd-item${location.pathname === '/register' ? ' nb-dd-on' : ''}`}
                        to="/register"
                        onClick={() => { setLoginDropdownOpen(false); setMobileMenuOpen(false); }}
                      >
                        <span className="nb-dd-arrow">✦</span>
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Logout — logged in */}
              {logged && (
                <button className="nb-logout-btn" onClick={logout}>
                  <span className="nb-link-gem">◎</span>
                  <span>Logout</span>
                  <span className="nb-sweep" />
                </button>
              )}
            </div>
          </div>

          {/* ── HAMBURGER ── */}
          <button
            className={`nb-burger${mobileMenuOpen ? ' nb-burger-open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="nb-bun nb-bun-t" />
            <span className="nb-bun nb-bun-m" />
            <span className="nb-bun nb-bun-b" />
          </button>
        </div>
      </nav>
    </>
  );
}

// ── All CSS as a template literal ─────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

  /* ── TOKENS ── */
  .nb-nav {
    --navy:        #04101f;
    --navy-d:      #0a1929;
    --navy-m:      #0d2347;
    --blue-dp:     #1338be;
    --blue-md:     #1a5fdb;
    --blue-vv:     #2979ff;
    --blue-lt:     #5c9fff;
    --blue-pl:     #90c9ff;
    --white:       #ffffff;
    --muted:       rgba(180,215,255,0.72);
    --glass:       rgba(5,16,36,0.60);
    --glass-s:     rgba(3,11,26,0.88);
    --border:      rgba(255,255,255,0.09);
    --border-b:    rgba(41,121,255,0.28);
    --ease:        cubic-bezier(0.4,0,0.2,1);
    --spring:      cubic-bezier(0.34,1.56,0.64,1);
    --font-d:      'Cormorant Garamond', Georgia, serif;
    --font-b:      'Outfit', system-ui, sans-serif;

    position: sticky;
    top: 0;
    z-index: 1000;
    font-family: var(--font-b);
    background: var(--glass);
    backdrop-filter: blur(48px) saturate(180%);
    -webkit-backdrop-filter: blur(48px) saturate(180%);
    border-bottom: 1px solid var(--border);
    transition: background 0.4s var(--ease), box-shadow 0.4s var(--ease), border-color 0.4s var(--ease);
  }

  .nb-scrolled {
    background: var(--glass-s);
    border-bottom-color: var(--border-b);
    box-shadow:
      0 10px 44px rgba(0,0,0,0.50),
      0 1px 0 rgba(41,121,255,0.18),
      inset 0 1px 0 rgba(255,255,255,0.04);
  }

  /* top shimmer line */
  .nb-shimmer-line {
    height: 2px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(41,121,255,0.45) 20%,
      rgba(144,201,255,1)   50%,
      rgba(41,121,255,0.45) 80%,
      transparent 100%
    );
    animation: nbPulse 4s ease-in-out infinite;
  }
  @keyframes nbPulse { 0%,100%{opacity:.4} 50%{opacity:1} }

  /* ── CONTAINER ── */
  .nb-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0.8rem clamp(1rem,4vw,2.5rem);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  /* ── BRAND ── */
  .nb-brand {
    position: relative;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
    transition: transform 0.35s var(--spring), filter 0.35s ease;
  }
  .nb-brand:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 6px 18px rgba(41,121,255,0.45));
  }

  .nb-svg-wrap {
    width: clamp(145px, 21vw, 210px);
    height: clamp(34px, 5.2vw, 50px);
    transition: opacity 0.3s ease;
  }

  /* radial halo on hover */
  .nb-brand-halo {
    position: absolute;
    inset: -10px -18px;
    border-radius: 22px;
    background: radial-gradient(ellipse at 30% 50%, rgba(41,121,255,0.13), transparent 68%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;
  }
  .nb-brand:hover .nb-brand-halo { opacity: 1; }

  /* ── DRAWER (desktop = flex row, mobile = slide panel) ── */
  .nb-drawer { display: flex; align-items: center; }
  .nb-backdrop { display: none; }

  .nb-drawer-inner {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  /* mobile panel header — hidden on desktop */
  .nb-panel-head { display: none; }

  /* ── NAV LINK ── */
  .nb-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    padding: 0.5rem 0.95rem;
    border-radius: 10px;
    text-decoration: none;
    color: var(--muted);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    border: 1px solid transparent;
    overflow: hidden;
    transition: color 0.22s var(--ease), background 0.22s var(--ease), border-color 0.22s var(--ease);
    white-space: nowrap;
  }

  .nb-link-gem {
    font-size: 0.65rem;
    opacity: 0.5;
    transition: opacity 0.2s ease, color 0.2s ease;
  }

  /* animated underline rail */
  .nb-link-rail {
    position: absolute;
    bottom: 4px; left: 50%;
    width: 0; height: 1.5px;
    background: linear-gradient(90deg, var(--blue-vv), var(--blue-pl));
    border-radius: 2px;
    transform: translateX(-50%);
    transition: width 0.28s var(--ease);
  }

  .nb-link:hover {
    color: var(--white);
    background: rgba(41,121,255,0.10);
    border-color: rgba(41,121,255,0.16);
  }
  .nb-link:hover .nb-link-gem  { opacity: 1; color: var(--blue-pl); }
  .nb-link:hover .nb-link-rail { width: 52%; }

  .nb-link-on {
    color: var(--white) !important;
    background: rgba(41,121,255,0.15) !important;
    border-color: rgba(41,121,255,0.30) !important;
    font-weight: 700;
    box-shadow: 0 0 16px rgba(41,121,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .nb-link-on .nb-link-gem  { opacity: 1; color: var(--blue-pl); }
  .nb-link-on .nb-link-rail { width: 52%; }

  /* admin badge */
  .nb-badge {
    font-size: 0.5rem;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 0.17rem 0.52rem;
    border-radius: 20px;
    background: linear-gradient(135deg, var(--blue-dp), var(--blue-vv));
    color: var(--white);
    border: 1px solid rgba(41,121,255,0.40);
    animation: nbBadge 2.5s ease-in-out infinite;
  }
  @keyframes nbBadge {
    0%,100% { box-shadow: 0 0 6px rgba(41,121,255,0.22); }
    50%      { box-shadow: 0 0 16px rgba(41,121,255,0.52); }
  }

  /* ── LOGIN DROPDOWN ── */
  .nb-dd-wrap { position: relative; }

  .nb-login-btn {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 0.48rem;
    padding: 0.5rem 1.1rem;
    border-radius: 10px;
    border: 1px solid rgba(41,121,255,0.40);
    background: linear-gradient(135deg, rgba(19,56,190,0.70), rgba(26,95,219,0.62));
    backdrop-filter: blur(20px);
    color: var(--white);
    font-family: var(--font-b);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.26s var(--ease);
    box-shadow: 0 4px 16px rgba(41,121,255,0.18), inset 0 1px 0 rgba(255,255,255,0.10);
  }
  .nb-login-btn:hover,
  .nb-login-open {
    background: linear-gradient(135deg, rgba(19,56,190,0.88), rgba(41,121,255,0.78)) !important;
    border-color: rgba(41,121,255,0.66) !important;
    box-shadow: 0 8px 28px rgba(41,121,255,0.32), inset 0 1px 0 rgba(255,255,255,0.14) !important;
    transform: translateY(-2px);
  }

  .nb-chevron {
    font-size: 1.1rem;
    line-height: 1;
    display: inline-block;
    transform: rotate(90deg);
    transition: transform 0.28s var(--ease);
  }
  .nb-chev-up { transform: rotate(-90deg); }

  /* dropdown panel */
  .nb-dd-panel {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 152px;
    background: linear-gradient(160deg, rgba(7,18,40,0.98), rgba(10,26,58,0.97));
    backdrop-filter: blur(52px) saturate(200%);
    border: 1px solid rgba(41,121,255,0.20);
    border-radius: 16px;
    overflow: hidden;
    box-shadow:
      0 24px 64px rgba(0,0,0,0.58),
      0 0 0 1px rgba(255,255,255,0.04),
      inset 0 1px 0 rgba(255,255,255,0.06);
    animation: nbDropIn 0.22s var(--spring);
    z-index: 1002;
  }
  @keyframes nbDropIn {
    from { opacity:0; transform: translateY(-10px) scale(0.96); }
    to   { opacity:1; transform: translateY(0)      scale(1); }
  }

  .nb-dd-top-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--blue-vv), var(--blue-pl), var(--blue-vv), transparent);
  }

  .nb-dd-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.8rem 1.15rem;
    text-decoration: none;
    color: var(--muted);
    font-family: var(--font-b);
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s var(--ease);
  }
  .nb-dd-item:hover {
    background: rgba(41,121,255,0.13);
    color: var(--white);
    padding-left: 1.5rem;
  }
  .nb-dd-on { background: rgba(41,121,255,0.17); color: var(--white); }

  .nb-dd-arrow {
    font-size: 0.65rem;
    color: var(--blue-lt);
    transition: transform 0.2s ease;
  }
  .nb-dd-item:hover .nb-dd-arrow { transform: translateX(3px); }

  .nb-dd-rule {
    height: 1px;
    margin: 0 1rem;
    background: rgba(255,255,255,0.05);
  }

  /* ── LOGOUT ── */
  .nb-logout-btn {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 0.48rem;
    padding: 0.5rem 1.1rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    color: var(--muted);
    font-family: var(--font-b);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.26s var(--ease);
  }
  .nb-logout-btn:hover {
    background: rgba(200,38,38,0.13);
    border-color: rgba(200,38,38,0.36);
    color: #fca5a5;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(200,38,38,0.13);
  }

  /* shared glow sweep */
  .nb-sweep {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
    pointer-events: none;
  }
  .nb-login-btn:hover .nb-sweep,
  .nb-logout-btn:hover .nb-sweep { transform: translateX(100%); }

  /* ── HAMBURGER ── */
  .nb-burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    padding: 9px 10px;
    border: 1px solid rgba(41,121,255,0.26);
    border-radius: 10px;
    background: rgba(41,121,255,0.08);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.28s var(--ease);
  }
  .nb-burger:hover {
    background: rgba(41,121,255,0.17);
    border-color: rgba(41,121,255,0.46);
    box-shadow: 0 0 18px rgba(41,121,255,0.18);
  }
  .nb-bun {
    display: block;
    width: 20px;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--blue-vv), var(--blue-pl));
    transition: transform 0.34s var(--ease), opacity 0.34s ease;
    transform-origin: center;
  }
  .nb-burger-open .nb-bun-t { transform: translateY(7px) rotate(45deg); }
  .nb-burger-open .nb-bun-m { opacity: 0; transform: scaleX(0); }
  .nb-burger-open .nb-bun-b { transform: translateY(-7px) rotate(-45deg); }

  /* ══════════════════════════════════════
     MOBILE  ≤ 768 px
  ══════════════════════════════════════ */
  @media (max-width: 768px) {
    .nb-burger { display: flex; }

    .nb-drawer {
      position: fixed;
      top: 0; right: 0;
      height: 100vh;
      width: min(292px, 88vw);
      background: linear-gradient(162deg, rgba(3,12,28,0.99) 0%, rgba(9,24,54,0.98) 100%);
      backdrop-filter: blur(72px) saturate(210%);
      -webkit-backdrop-filter: blur(72px) saturate(210%);
      border-left: 1px solid rgba(41,121,255,0.16);
      box-shadow: -28px 0 80px rgba(0,0,0,0.60);
      transform: translateX(110%);
      transition: transform 0.38s var(--ease);
      z-index: 999;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* animated left-edge shimmer on panel */
    .nb-drawer::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 2px; height: 100%;
      background: linear-gradient(180deg,
        transparent,
        rgba(41,121,255,0.50) 30%,
        rgba(144,201,255,0.90) 50%,
        rgba(41,121,255,0.50) 70%,
        transparent
      );
      animation: nbPulse 4s ease-in-out infinite;
    }

    .nb-drawer-open { transform: translateX(0); }

    /* dimmed backdrop */
    .nb-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.60);
      z-index: -1;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.38s ease;
    }
    .nb-drawer-open .nb-backdrop { opacity: 1; pointer-events: auto; }

    .nb-drawer-inner {
      flex-direction: column;
      align-items: stretch;
      padding: 0 1.25rem 2.5rem;
      gap: 0.45rem;
      min-height: 100%;
    }

    /* panel header */
    .nb-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.4rem 0 1.35rem;
      border-bottom: 1px solid rgba(41,121,255,0.13);
      margin-bottom: 0.6rem;
    }
    .nb-panel-eyebrow {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: rgba(144,201,255,0.45);
    }
    .nb-panel-close {
      background: none;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 8px;
      color: rgba(144,201,255,0.45);
      font-size: 0.78rem;
      padding: 0.28rem 0.58rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: var(--font-b);
    }
    .nb-panel-close:hover { background: rgba(255,255,255,0.06); color: var(--white); }

    /* full-width links */
    .nb-link {
      width: 100%;
      padding: 0.82rem 1rem;
      border-radius: 12px;
      font-size: 0.95rem;
    }

    .nb-dd-wrap  { width: 100%; }
    .nb-login-btn {
      width: 100%;
      justify-content: center;
      padding: 0.82rem 1rem;
      border-radius: 12px;
    }
    .nb-login-btn:hover  { transform: none !important; }

    .nb-dd-panel {
      position: static;
      width: 100%;
      margin-top: 0.45rem;
      border-radius: 12px;
      animation: none;
    }

    .nb-logout-btn {
      width: 100%;
      justify-content: center;
      padding: 0.82rem 1rem;
      border-radius: 12px;
    }
    .nb-logout-btn:hover { transform: none; }
  }

  @media (max-width: 480px) {
    .nb-container { padding: 0.7rem 1rem; }
    .nb-svg-wrap  { width: clamp(130px,44vw,175px); height: clamp(30px,9vw,40px); }
  }

  @media (max-width: 360px) {
    .nb-svg-wrap  { width: 128px; height: 30px; }
    .nb-container { padding: 0.6rem 0.85rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;