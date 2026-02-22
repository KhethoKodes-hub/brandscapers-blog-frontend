// client/src/components/Home.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredStat, setHoveredStat] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get('/posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="home-root">
      {/* Layered animated background */}
      <div className="bg-base" />
      <div className="bg-noise" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-lines" />

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-glass">
          <div className="hero-top-line" />

          <div className="hero-badge-row">
            <span className="hero-badge">✦ EST. 2024 ✦ AFRICA</span>
          </div>

          <h1 className="hero-title">
            <span className="hero-title-top">Brandscapers</span>
            <span className="hero-title-bottom">Africa Blog</span>
          </h1>

          <p className="hero-subtitle">
            Transformative insights. Innovative strategies. Inspiring stories —
            shaping the future of branding across Africa and beyond.
          </p>

          <div className="hero-divider">
            <span className="hero-divider-dot" />
            <span className="hero-divider-line" />
            <span className="hero-divider-diamond">◇</span>
            <span className="hero-divider-line" />
            <span className="hero-divider-dot" />
          </div>

          <div className="stats-row">
            {[
              { value: posts.length, label: 'Articles', icon: '◈' },
              { value: posts.reduce((t, p) => t + (p.likes || 0), 0), label: 'Total Likes', icon: '◉' },
              { value: posts.filter(p => p.published).length, label: 'Published', icon: '✦' },
            ].map((s, i) => (
              <div
                key={i}
                className={`stat-card ${hoveredStat === i ? 'stat-hovered' : ''}`}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-number">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-line" />
          <span className="scroll-text">SCROLL TO EXPLORE</span>
        </div>
      </section>

      {/* ── SECTION HEADING ── */}
      {!loading && posts.length > 0 && (
        <div className="section-heading">
          <span className="section-eyebrow">LATEST STORIES</span>
          <div className="section-rule"><span /></div>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className="loading-wrap">
          <div className="loading-ring">
            <div /><div /><div /><div />
          </div>
          <p className="loading-text">Curating your experience…</p>
        </div>
      )}

      {/* ── POSTS GRID ── */}
      {!loading && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((p, index) => {
            const isHovered = hoveredCard === p._id;
            return (
              <article
                key={p._id}
                className={`post-card ${isHovered ? 'post-card-hovered' : ''}`}
                style={{ animationDelay: `${index * 0.12}s` }}
                onMouseEnter={() => setHoveredCard(p._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Accent line at top */}
                <div className="card-top-accent" />

                {/* Image area */}
                <div className="card-image-wrap">
                  <div className={`card-image-overlay ${isHovered ? 'overlay-hovered' : ''}`} />
                  {p.coverImage ? (
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className={`card-img ${isHovered ? 'card-img-hovered' : ''}`}
                    />
                  ) : (
                    <div className={`card-placeholder ${isHovered ? 'placeholder-hovered' : ''}`}>
                      <span className="placeholder-icon">✦</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`card-badge ${p.published ? 'badge-live' : 'badge-draft'}`}>
                    <span className="badge-dot" />
                    {p.published ? 'Live' : 'Draft'}
                  </div>

                  {/* Index number */}
                  <div className="card-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Content */}
                <div className="card-body">
                  <h2 className="card-title">{p.title}</h2>

                  <p className={`card-excerpt ${isHovered ? 'excerpt-hovered' : ''}`}>
                    {p.excerpt || (p.content && p.content.replace(/<[^>]*>/g, '').slice(0, 180) + '…')}
                  </p>

                  {/* Tags */}
                  {p.tags && (
                    <div className="card-tags">
                      {(Array.isArray(p.tags) ? p.tags : p.tags.split(','))
                        .slice(0, 3)
                        .map((tag, ti) => (
                          <span key={ti} className="tag-pill">
                            {tag.trim()}
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="card-footer">
                    <Link to={`/post/${p.slug}`} className={`read-btn ${isHovered ? 'read-btn-hovered' : ''}`}>
                      <span className="read-btn-text">Read Story</span>
                      <span className="read-btn-arrow">→</span>
                      <span className="read-btn-glow" />
                    </Link>

                    <div className="like-pill">
                      <span className="like-heart">❤</span>
                      <span className="like-count">{p.likes || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="card-corner-tl" />
                <div className="card-corner-br" />
              </article>
            );
          })}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <span className="empty-icon">✦</span>
            <div className="empty-icon-ring" />
          </div>
          <h3 className="empty-title">No Stories Yet</h3>
          <p className="empty-text">
            Our content team is crafting something extraordinary.
            Check back soon for inspiring content.
          </p>
        </div>
      )}

      {/* ── FOOTER STRIP ── */}
      <div className="footer-strip">
        <span className="footer-text">Brandscapers Africa · Shaping the Narrative</span>
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
        .home-root {
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: hidden;
          padding-bottom: 0;
        }

        /* ── BACKGROUND SYSTEM ── */
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

        /* ── HERO ── */
        .hero-section {
          position: relative; z-index: 1;
          padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem) clamp(2rem, 5vw, 4rem);
          display: flex; flex-direction: column; align-items: center;
          min-height: min(100vh, 900px);
          justify-content: center;
        }

        .hero-glass {
          position: relative;
          width: 100%; max-width: 960px;
          background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(60px) saturate(200%);
          -webkit-backdrop-filter: blur(60px) saturate(200%);
          border-radius: clamp(24px, 4vw, 48px);
          border: 1px solid var(--glass-border);
          padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 5vw, 5rem);
          text-align: center;
          box-shadow:
            0 40px 100px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.25),
            0 0 80px rgba(41,121,255,0.12);
          overflow: hidden;
        }

        .hero-top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(41,121,255,0.7), rgba(92,159,255,1), rgba(41,121,255,0.7), transparent);
          animation: shimmer-line 4s ease-in-out infinite;
        }

        @keyframes shimmer-line {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .hero-badge-row { margin-bottom: 2rem; }

        .hero-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: clamp(0.6rem, 1.5vw, 0.7rem);
          font-weight: 700;
          letter-spacing: 4px;
          color: var(--blue-pale);
          border: 1px solid rgba(144,201,255,0.3);
          border-radius: 40px;
          padding: 0.5rem 1.5rem;
          background: rgba(41,121,255,0.1);
          backdrop-filter: blur(20px);
        }

        .hero-title {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 1.75rem;
          gap: 0.1em;
        }

        .hero-title-top {
          font-family: var(--font-display);
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 700;
          font-style: italic;
          color: var(--white);
          line-height: 1;
          letter-spacing: -0.03em;
          text-shadow: 0 0 60px rgba(255,255,255,0.2);
        }

        .hero-title-bottom {
          font-family: var(--font-body);
          font-size: clamp(0.9rem, 3vw, 1.4rem);
          font-weight: 300;
          letter-spacing: clamp(4px, 2vw, 12px);
          text-transform: uppercase;
          background: linear-gradient(90deg, var(--blue-pale), var(--white), var(--blue-pale));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: text-shimmer 5s ease-in-out infinite;
          background-size: 200%;
        }

        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle {
          color: var(--text-muted-dark);
          font-size: clamp(0.95rem, 2.5vw, 1.2rem);
          font-weight: 400;
          line-height: 1.8;
          max-width: 620px;
          margin: 0 auto 2.5rem;
        }

        /* Divider */
        .hero-divider {
          display: flex; align-items: center; justify-content: center;
          gap: 0.75rem; margin-bottom: 2.5rem;
        }
        .hero-divider-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.4); }
        .hero-divider-line { flex: 1; max-width: 80px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); }
        .hero-divider-diamond { color: rgba(144,201,255,0.6); font-size: 0.8rem; }

        /* Stats */
        .stats-row {
          display: flex; justify-content: center; flex-wrap: wrap;
          gap: clamp(0.75rem, 2vw, 1.5rem);
        }

        .stat-card {
          flex: 1; min-width: 110px; max-width: 180px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 2vw, 1.5rem);
          text-align: center;
          cursor: default;
          transition: all 0.4s var(--ease-out);
          position: relative; overflow: hidden;
        }

        .stat-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(41,121,255,0.15), transparent);
          opacity: 0; transition: opacity 0.4s;
        }

        .stat-hovered {
          transform: translateY(-8px);
          border-color: rgba(41,121,255,0.5);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3), 0 0 30px rgba(41,121,255,0.2);
        }
        .stat-hovered::before { opacity: 1; }

        .stat-icon { font-size: 1rem; color: var(--blue-light); margin-bottom: 0.5rem; }

        .stat-number {
          font-family: var(--font-display);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1;
          margin-bottom: 0.4rem;
          text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        .stat-label {
          font-size: clamp(0.6rem, 1.5vw, 0.72rem);
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--blue-pale);
          opacity: 0.8;
        }

        /* Scroll indicator */
        .scroll-indicator {
          display: flex; flex-direction: column; align-items: center;
          margin-top: clamp(2rem, 4vw, 3rem);
          gap: 0.75rem;
          animation: scroll-bounce 2.5s ease-in-out infinite;
        }

        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(8px); opacity: 1; }
        }

        .scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent); }
        .scroll-text { font-size: 0.6rem; font-weight: 700; letter-spacing: 3px; color: rgba(255,255,255,0.4); }

        /* ── SECTION HEADING ── */
        .section-heading {
          position: relative; z-index: 1;
          text-align: center;
          padding: clamp(1rem, 3vw, 2rem) 1.5rem clamp(1.5rem, 3vw, 2.5rem);
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }

        .section-eyebrow {
          font-size: 0.65rem; font-weight: 800; letter-spacing: 5px;
          color: var(--blue-pale); opacity: 0.8;
        }

        .section-rule {
          width: 60px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--blue-vivid), transparent);
        }

        /* ── POSTS GRID ── */
        .posts-grid {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
          gap: clamp(1.25rem, 3vw, 2.5rem);
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 clamp(1rem, 3vw, 2.5rem) clamp(3rem, 6vw, 6rem);
        }

        /* ── POST CARD ── */
        .post-card {
          position: relative;
          background: linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(50px) saturate(180%);
          -webkit-backdrop-filter: blur(50px) saturate(180%);
          border-radius: clamp(20px, 3vw, 32px);
          border: 1px solid var(--glass-border);
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.5s var(--ease-out);
          box-shadow:
            0 20px 60px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.2);
          opacity: 0;
          animation: card-rise 0.7s var(--ease-spring) forwards;
          cursor: pointer;
        }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(50px) scale(0.94); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .post-card-hovered {
          transform: translateY(-16px) scale(1.02);
          border-color: rgba(41,121,255,0.5);
          box-shadow:
            0 50px 100px rgba(0,0,0,0.4),
            0 0 0 1px rgba(41,121,255,0.3),
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 0 60px rgba(41,121,255,0.15);
        }

        .card-top-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 0;
          background: linear-gradient(90deg, var(--navy-bright), var(--blue-vivid), var(--blue-light));
          transition: height 0.4s var(--ease-out);
          z-index: 2;
        }

        .post-card-hovered .card-top-accent { height: 2px; }

        /* Image */
        .card-image-wrap {
          position: relative; height: clamp(200px, 28vw, 260px); overflow: hidden;
          background: linear-gradient(135deg, var(--navy-dark), var(--navy-mid), var(--blue-mid));
          flex-shrink: 0;
        }

        .card-image-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom, rgba(4,16,31,0.2) 0%, rgba(10,25,41,0.55) 100%);
          transition: background 0.5s ease;
        }
        .overlay-hovered {
          background: linear-gradient(to bottom, rgba(4,16,31,0.05) 0%, rgba(19,56,190,0.4) 100%);
        }

        .card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.8s var(--ease-out), filter 0.6s ease;
          transform: scale(1.06);
          filter: brightness(0.95) saturate(1.1);
        }
        .card-img-hovered {
          transform: scale(1.16) rotate(0.8deg);
          filter: brightness(1.08) saturate(1.2) contrast(1.05);
        }

        .card-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--navy-mid), var(--navy-bright), var(--blue-mid));
          transition: all 0.5s ease;
        }
        .placeholder-hovered { background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid)); }

        .placeholder-icon {
          font-size: clamp(3rem, 8vw, 5rem);
          color: rgba(255,255,255,0.15);
          transition: all 0.5s var(--ease-spring);
        }
        .placeholder-hovered .placeholder-icon {
          color: rgba(255,255,255,0.3);
          transform: scale(1.4) rotate(15deg);
        }

        /* Badges */
        .card-badge {
          position: absolute; top: 1.25rem; left: 1.25rem; z-index: 3;
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.35rem 0.9rem;
          border-radius: 30px;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.5px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .badge-live { background: rgba(19,56,190,0.85); color: #aecbff; }
        .badge-draft { background: rgba(146,64,14,0.85); color: #fde68a; }

        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        .badge-live .badge-dot { background: #90c9ff; box-shadow: 0 0 6px #90c9ff; }
        .badge-draft .badge-dot { background: #fde68a; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }

        .card-number {
          position: absolute; bottom: 1.25rem; right: 1.25rem; z-index: 3;
          font-family: var(--font-display);
          font-size: 2.5rem; font-weight: 700; font-style: italic;
          color: rgba(255,255,255,0.12);
          line-height: 1;
          transition: color 0.4s ease;
        }
        .post-card-hovered .card-number { color: rgba(255,255,255,0.22); }

        /* Card body */
        .card-body {
          padding: clamp(1.5rem, 3vw, 2.25rem);
          flex: 1; display: flex; flex-direction: column; gap: 1rem;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 2.5vw, 1.7rem);
          font-weight: 700;
          color: var(--white);
          line-height: 1.3;
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-excerpt {
          font-size: clamp(0.875rem, 1.5vw, 0.95rem);
          color: var(--text-muted-dark);
          line-height: 1.75;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: -webkit-line-clamp 0.3s;
          flex: 1;
        }
        .excerpt-hovered { -webkit-line-clamp: 5; }

        /* Tags */
        .card-tags {
          display: flex; flex-wrap: wrap; gap: 0.5rem;
        }

        .tag-pill {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          color: var(--blue-pale);
          background: rgba(41,121,255,0.15);
          border: 1px solid rgba(41,121,255,0.25);
          border-radius: 20px;
          padding: 0.25rem 0.75rem;
          transition: all 0.3s ease;
        }
        .post-card-hovered .tag-pill {
          background: rgba(41,121,255,0.25);
          border-color: rgba(41,121,255,0.45);
        }

       /* Updated Footer styles for better mobile responsiveness */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.read-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: var(--white);
  transition: all 0.4s var(--ease-out);
  backdrop-filter: blur(20px);
  white-space: nowrap; /* Prevents text wrapping */
}

.like-pill {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.1rem;
  border-radius: 30px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  white-space: nowrap; /* Prevents text wrapping */
}

/* Mobile Responsive Fixes */
@media (max-width: 768px) {
  .card-footer {
    flex-direction: row; /* Keep horizontal on tablets */
    gap: 0.5rem;
  }
  
  .read-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
    flex: 1; /* Takes available space */
  }
  
  .like-pill {
    padding: 0.5rem 0.9rem;
    font-size: 0.8rem;
    flex-shrink: 0; /* Prevents shrinking */
  }
}

@media (max-width: 480px) {
  .card-footer {
    flex-direction: row; /* Keep horizontal, don't stack */
    gap: 0.4rem;
  }
  
  .read-btn {
    padding: 0.5rem 1rem;
    font-size: 0.7rem;
    gap: 0.3rem;
    flex: 1;
  }
  
  .read-btn-text {
    font-size: 0.7rem;
  }
  
  .read-btn-arrow {
    font-size: 0.8rem;
  }
  
  .like-pill {
    padding: 0.4rem 0.8rem;
    gap: 0.3rem;
  }
  
  .like-heart {
    font-size: 0.7rem;
  }
  
  .like-count {
    font-size: 0.7rem;
  }
}

@media (max-width: 360px) {
  .card-footer {
    gap: 0.3rem;
  }
  
  .read-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.65rem;
  }
  
  .read-btn-text {
    font-size: 0.65rem;
  }
  
  .read-btn-arrow {
    font-size: 0.7rem;
  }
  
  .like-pill {
    padding: 0.35rem 0.7rem;
  }
  
  .like-heart, .like-count {
    font-size: 0.65rem;
  }
}

/* For very small devices where text might still overflow */
@media (max-width: 320px) {
  .read-btn-text {
    display: none; /* Hide text on extremely small screens */
  }
  
  .read-btn {
    padding: 0.4rem 0.6rem;
  }
  
  .read-btn-arrow {
    font-size: 0.8rem;
    margin: 0;
  }
}

/* Hover states remain the same */
.read-btn-hovered {
  background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
  border-color: rgba(41,121,255,0.6);
  box-shadow: 0 8px 25px rgba(41,121,255,0.35);
  transform: translateY(-2px);
}

.read-btn-arrow {
  transition: transform 0.3s var(--ease-spring);
}

.read-btn-hovered .read-btn-arrow {
  transform: translateX(5px);
}

.read-btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.read-btn-hovered .read-btn-glow {
  transform: translateX(100%);
}

.post-card-hovered .like-pill {
  background: rgba(255,80,120,0.15);
  border-color: rgba(255,80,120,0.3);
}
        /* Corner decorations */
        .card-corner-tl, .card-corner-br {
          position: absolute; width: 24px; height: 24px;
          border-color: rgba(41,121,255,0.3);
          border-style: solid;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .card-corner-tl { top: 12px; left: 12px; border-width: 1px 0 0 1px; }
        .card-corner-br { bottom: 12px; right: 12px; border-width: 0 1px 1px 0; }
        .post-card-hovered .card-corner-tl,
        .post-card-hovered .card-corner-br { opacity: 1; }

        /* ── LOADING ── */
        .loading-wrap {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 40vh; gap: 2rem;
        }

        .loading-ring {
          display: inline-block; position: relative; width: 64px; height: 64px;
        }
        .loading-ring div {
          box-sizing: border-box; display: block; position: absolute;
          width: 52px; height: 52px; margin: 6px;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: ring-spin 1.3s cubic-bezier(0.5,0,0.5,1) infinite;
        }
        .loading-ring div:nth-child(1) { border-top-color: var(--blue-vivid); animation-delay: -0.45s; }
        .loading-ring div:nth-child(2) { border-top-color: var(--blue-light); animation-delay: -0.3s; }
        .loading-ring div:nth-child(3) { border-top-color: var(--blue-pale); animation-delay: -0.15s; }
        .loading-ring div:nth-child(4) { border-top-color: rgba(255,255,255,0.3); }

        @keyframes ring-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 0.85rem; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--blue-pale); opacity: 0.7;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          position: relative; z-index: 1;
          max-width: 600px; margin: 0 auto;
          padding: clamp(3rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem);
          text-align: center;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04));
          backdrop-filter: blur(50px);
          border: 1px solid var(--glass-border);
          border-radius: clamp(24px, 4vw, 40px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.3);
        }

        .empty-icon-wrap {
          position: relative; display: inline-flex;
          align-items: center; justify-content: center;
          width: 80px; height: 80px; margin: 0 auto 2rem;
        }

        .empty-icon {
          font-size: 2rem; color: var(--blue-pale);
          position: relative; z-index: 1;
          animation: icon-pulse 3s ease-in-out infinite;
        }

        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        .empty-icon-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1px solid rgba(41,121,255,0.3);
          animation: ring-expand 2.5s ease-in-out infinite;
        }

        @keyframes ring-expand {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700; font-style: italic;
          color: var(--white); margin-bottom: 1rem;
        }
        .empty-text {
          font-size: clamp(0.9rem, 2vw, 1.05rem);
          color: var(--text-muted-dark); line-height: 1.75;
        }

        /* ── FOOTER STRIP ── */
        .footer-strip {
          position: relative; z-index: 1;
          text-align: center;
          padding: clamp(1.5rem, 3vw, 2.5rem);
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(20px);
        }

        .footer-text {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 4px;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .hero-glass { padding: 2.5rem 1.5rem; }
          .stats-row { gap: 0.75rem; }
          .stat-card { min-width: 90px; padding: 1.25rem 0.75rem; }
          .posts-grid { padding: 0 1rem 3rem; }
          .scroll-indicator { display: none; }
          .section-heading { padding: 1rem 1rem 1.5rem; }
        }

        @media (max-width: 480px) {
          .hero-title-top { font-size: clamp(2.5rem, 12vw, 4rem); }
          .hero-title-bottom { font-size: 0.8rem; letter-spacing: 3px; }
          .stat-card { flex: 0 0 calc(33% - 0.5rem); }
          .stat-number { font-size: 1.8rem; }
          .card-footer { flex-direction: column; align-items: stretch; }
          .read-btn { justify-content: center; }
          .like-pill { justify-content: center; }
          .posts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 360px) {
          .hero-badge { font-size: 0.55rem; letter-spacing: 2.5px; padding: 0.4rem 1rem; }
          .hero-title-top { font-size: 2.2rem; }
          .stat-card { flex: 0 0 calc(33% - 0.5rem); padding: 1rem 0.5rem; }
          .stat-number { font-size: 1.5rem; }
          .stat-label { font-size: 0.5rem; letter-spacing: 1px; }
          .card-body { padding: 1.25rem; }
        }

        @media (hover: none) {
          .post-card { animation-delay: 0s !important; }
          .post-card-hovered { transform: none; }
        } 

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}