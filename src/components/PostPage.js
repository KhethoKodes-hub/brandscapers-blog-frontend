// client/src/components/PostPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

export default function PostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [hoveredComment, setHoveredComment] = useState(null);
  const [commentReactions, setCommentReactions] = useState({});
  const [reactionAnimations, setReactionAnimations] = useState({});
  const [userReactedComments, setUserReactedComments] = useState({});
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [hoveredShare, setHoveredShare] = useState(null);
  const [sharePulse, setSharePulse] = useState(false);
  const [orbitActive, setOrbitActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [heartBurst, setHeartBurst] = useState([]);
  const [orbitalHearts, setOrbitalHearts] = useState([]);
  const [explosionParticles, setExplosionParticles] = useState([]);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setReadProgress(height > 0 ? (scrolled / height) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get(`/posts/slug/${slug}`);
        setPost({ ...res.data, liked: res.data.liked || false });

        const storedReactions = JSON.parse(localStorage.getItem(`post_${slug}_reactions`)) || {};
        if (res.data.comments) {
          const initialReactions = { ...storedReactions };
          res.data.comments.forEach(comment => {
            if (comment._id && comment.reactions) {
              Object.entries(comment.reactions).forEach(([type, count]) => {
                const key = `${comment._id}-${type}`;
                if (!initialReactions[key]) initialReactions[key] = count;
              });
            }
          });
          if (Object.keys(storedReactions).length === 0 && Object.keys(initialReactions).length > 0) {
            setCommentReactions(initialReactions);
            localStorage.setItem(`post_${slug}_reactions`, JSON.stringify(initialReactions));
          } else {
            setCommentReactions(storedReactions);
          }
        } else {
          setCommentReactions(storedReactions);
        }

        const userReactions = JSON.parse(localStorage.getItem(`user_reactions_${slug}`)) || {};
        setUserReactedComments(userReactions);
      } catch (err) {
        console.error('LOAD POST ERROR:', err);
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSharePulse(true);
      setTimeout(() => setSharePulse(false), 1500);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await API.put(`/posts/${post._id}/like`);
      setPost(prev => ({ ...prev, likes: res.data.likes, liked: res.data.liked }));

      if (res.data.liked) {
        setShowHeartAnimation(true);
        const heartCount = isMobile ? 20 : 30;
        const burstHearts = [];
        for (let i = 0; i < heartCount; i++) {
          const spiralTurns = 3;
          const angle = (Math.PI * 2 * spiralTurns * i) / heartCount;
          const distance = 60 + (i / heartCount) * 180;
          burstHearts.push({
            id: `burst-${Date.now()}-${i}`,
            angle, distance,
            size: 0.4 + Math.random() * 1.2,
            rotation: Math.random() * 720,
            delay: i * 25,
            color: ['#ff1744', '#f50057', '#ff4081', '#ff6b9d', '#ff8fab', '#ffa3ba'][Math.floor(Math.random() * 6)],
            type: ['❤️', '💖', '💕', '💗', '💓'][Math.floor(Math.random() * 5)]
          });
        }
        const orbits = [];
        for (let i = 0; i < (isMobile ? 8 : 12); i++) {
          const orbitRadius = 100 + (i % 3) * 40;
          orbits.push({
            id: `orbit-${Date.now()}-${i}`,
            radius: orbitRadius,
            speed: 1 + Math.random() * 2,
            startAngle: (Math.PI * 2 * i) / (isMobile ? 8 : 12),
            size: 0.6 + Math.random() * 0.8,
            delay: i * 50
          });
        }
        const particles = [];
        for (let i = 0; i < (isMobile ? 30 : 50); i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = 50 + Math.random() * 150;
          particles.push({
            id: `particle-${Date.now()}-${i}`,
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            size: 2 + Math.random() * 6,
            color: ['#ff1744', '#f50057', '#ff4081', '#ffeb3b', '#fff'][Math.floor(Math.random() * 5)],
            delay: i * 10
          });
        }
        setHeartBurst(burstHearts);
        setOrbitalHearts(orbits);
        setExplosionParticles(particles);
        setTimeout(() => {
          setShowHeartAnimation(false);
          setHeartBurst([]);
          setOrbitalHearts([]);
          setExplosionParticles([]);
        }, 3000);
      }
    } catch (err) {
      console.error('LIKE POST ERROR:', err);
      alert('You must be logged in to like this post');
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await API.post(`/posts/${post._id}/comments`, { text: commentText });
      const res = await API.get(`/posts/slug/${slug}`);
      setPost(res.data);
      setCommentText('');
    } catch (err) {
      console.error('POST COMMENT ERROR:', err);
      alert('Failed to post comment');
    }
  };

  const handleCommentReaction = (commentId, reactionType, emoji) => {
    if (!post) return;
    const reactionKey = `${commentId}-${reactionType}`;
    const userReactionsKey = `${commentId}`;
    const currentUserReactions = { ...userReactedComments };
    const userHasReacted = currentUserReactions[userReactionsKey];

    if (userHasReacted === reactionType) {
      const updatedReactions = { ...commentReactions };
      const currentCount = updatedReactions[reactionKey] || 0;
      if (currentCount > 0) {
        updatedReactions[reactionKey] = currentCount - 1;
        delete currentUserReactions[userReactionsKey];
        setCommentReactions(updatedReactions);
        setUserReactedComments(currentUserReactions);
        localStorage.setItem(`post_${slug}_reactions`, JSON.stringify(updatedReactions));
        localStorage.setItem(`user_reactions_${slug}`, JSON.stringify(currentUserReactions));
      }
    } else if (userHasReacted) {
      const updatedReactions = { ...commentReactions };
      const previousReactionKey = `${commentId}-${userHasReacted}`;
      const previousCount = updatedReactions[previousReactionKey] || 0;
      if (previousCount > 0) updatedReactions[previousReactionKey] = previousCount - 1;
      updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
      currentUserReactions[userReactionsKey] = reactionType;
      setCommentReactions(updatedReactions);
      setUserReactedComments(currentUserReactions);
      localStorage.setItem(`post_${slug}_reactions`, JSON.stringify(updatedReactions));
      localStorage.setItem(`user_reactions_${slug}`, JSON.stringify(currentUserReactions));
      triggerReactionAnimation(commentId, reactionType, emoji);
    } else {
      const updatedReactions = { ...commentReactions };
      updatedReactions[reactionKey] = (updatedReactions[reactionKey] || 0) + 1;
      currentUserReactions[userReactionsKey] = reactionType;
      setCommentReactions(updatedReactions);
      setUserReactedComments(currentUserReactions);
      localStorage.setItem(`post_${slug}_reactions`, JSON.stringify(updatedReactions));
      localStorage.setItem(`user_reactions_${slug}`, JSON.stringify(currentUserReactions));
      triggerReactionAnimation(commentId, reactionType, emoji);
    }
  };

  const triggerReactionAnimation = (commentId, reactionType, emoji) => {
    const animKey = `${commentId}-${reactionType}-${Date.now()}`;
    setReactionAnimations(prev => ({ ...prev, [animKey]: { emoji, commentId, reactionType } }));
    setTimeout(() => {
      setReactionAnimations(prev => {
        const n = { ...prev };
        delete n[animKey];
        return n;
      });
    }, 1000);
  };

  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(post?.title || '')}`, '_blank', 'width=600,height=400');
  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this post: ${post?.title || ''}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
  const shareOnLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400');
  const shareOnInstagram = () => { navigator.clipboard.writeText(window.location.href).then(() => alert('✨ Link copied! Share it on Instagram 📱')).catch(() => alert('Copy: ' + window.location.href)); };
  const copyToClipboard = () => { navigator.clipboard.writeText(window.location.href).then(() => { setShowShareTooltip(true); setTimeout(() => setShowShareTooltip(false), 2000); }).catch(() => alert('Copy manually: ' + window.location.href)); };
  const shareViaEmail = () => { window.location.href = `mailto:?subject=${encodeURIComponent(`✨ ${post?.title || ''}`)}&body=${encodeURIComponent(`I found this article:\n\n${post?.title}\n\n${window.location.href}`)}`; };
  const shareViaWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${post?.title || ''}\n${window.location.href}`)}`, '_blank');
  const shareViaTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post?.title || '')}`, '_blank');
  const shareViaReddit = () => window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post?.title || '')}`, '_blank');

  const hasUserReacted = (commentId, reactionType) => userReactedComments[commentId] === reactionType;

  const sharePlatforms = [
    { platform: 'facebook', icon: 'f', color: '#1877F2', hoverIcon: 'fb', action: shareOnFacebook, label: 'Facebook', mobileIcon: '𝐟' },
    { platform: 'twitter', icon: '𝕏', color: '#000000', hoverIcon: '𝕏→', action: shareOnTwitter, label: 'Twitter', mobileIcon: '𝕏' },
    { platform: 'linkedin', icon: 'in', color: '#0077B5', hoverIcon: 'in↗', action: shareOnLinkedIn, label: 'LinkedIn', mobileIcon: 'in' },
    { platform: 'instagram', icon: '📸', color: '#E4405F', hoverIcon: '✨', action: shareOnInstagram, label: 'Instagram', mobileIcon: '📸' },
    { platform: 'whatsapp', icon: '💬', color: '#25D366', hoverIcon: '📲', action: shareViaWhatsApp, label: 'WhatsApp', mobileIcon: '💬' },
    { platform: 'telegram', icon: '✈️', color: '#0088CC', hoverIcon: '🚀', action: shareViaTelegram, label: 'Telegram', mobileIcon: '✈️' },
    { platform: 'reddit', icon: '👾', color: '#FF4500', hoverIcon: '🔥', action: shareViaReddit, label: 'Reddit', mobileIcon: '👾' },
    { platform: 'email', icon: '✉️', color: '#EA4335', hoverIcon: '📨', action: shareViaEmail, label: 'Email', mobileIcon: '✉️' },
    { platform: 'copy', icon: '📋', color: '#9C27B0', hoverIcon: '✅', action: copyToClipboard, label: 'Copy Link', mobileIcon: '📋' }
  ];

  // Loading state
  if (!post) {
    return (
      <div className="pp-root">
        <div className="pp-bg-base" />
        <div className="pp-bg-orb pp-orb-1" />
        <div className="pp-bg-orb pp-orb-2" />
        <div className="pp-bg-orb pp-orb-3" />
        <div className="pp-bg-lines" />
        <div className="pp-loading">
          <div className="pp-loading-ring"><div /><div /><div /><div /></div>
          <p className="pp-loading-text">Loading article…</p>
        </div>
        <style>{ppStyles}</style>
      </div>
    );
  }

  return (
    <div className="pp-root">
      <style>{ppStyles}</style>

      {/* Reading Progress Bar */}
      <div className="pp-progress-bar" style={{ width: `${readProgress}%` }} />

      {/* Background layers */}
      <div className="pp-bg-base" />
      <div className="pp-bg-noise" />
      <div className="pp-bg-orb pp-orb-1" />
      <div className="pp-bg-orb pp-orb-2" />
      <div className="pp-bg-orb pp-orb-3" />
      <div className="pp-bg-lines" />

      {/* Quantum Heart Animation */}
      {showHeartAnimation && (
        <div className="pp-heart-canvas">
          {/* Rainbow shockwave bursts */}
          {[
            { delay: 0,   color: '#ff0055', size: 160 },
            { delay: 0.1, color: '#ff6600', size: 140 },
            { delay: 0.2, color: '#ffdd00', size: 120 },
            { delay: 0.3, color: '#00ff99', size: 100 },
            { delay: 0.4, color: '#6644ff', size: 80  },
          ].map((s, i) => (
            <div key={`shock-${i}`} className="pp-shockwave" style={{
              animationDelay: `${s.delay}s`,
              borderWidth: `${4 - i * 0.5}px`,
              borderColor: s.color,
              width: `${s.size}px`,
              height: `${s.size}px`,
              boxShadow: `0 0 30px ${s.color}80, inset 0 0 20px ${s.color}40`
            }} />
          ))}
          {/* Spinning energy rings */}
          {['#ff0055','#ffdd00','#00ff99'].map((color, i) => (
            <div key={`energy-${i}`} className="pp-energy-ring" style={{ animationDelay: `${i * 0.15}s`, borderColor: color, opacity: 0.7 - i * 0.15, boxShadow: `0 0 15px ${color}` }} />
          ))}
          {/* Rainbow screen flash */}
          <div className="pp-screen-flash" />

          {/* Rainbow CSS heart - cycles through 5 colors */}
          <div className="pp-main-heart" style={{ width: isMobile ? '80px' : '150px', height: isMobile ? '80px' : '150px' }}>
            <div className="pp-heart-shape pp-rainbow-heart" />
          </div>

          {/* Rainbow shockwave rings */}
          {['#ff0000','#ff8800','#ffff00','#00ff88','#0088ff'].map((color, i) => (
            <div key={`rainbow-shock-${i}`} className="pp-rainbow-ring" style={{ animationDelay: `${i * 0.12}s`, borderColor: color, boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}40` }} />
          ))}

          {/* Bouncing satellite hearts */}
          {['#ff0055','#ff6600','#ffdd00','#00ff99','#6644ff'].map((color, i) => (
            <div key={`sat-${i}`} className="pp-satellite-heart" style={{ '--sat-angle': `${i * 72}deg`, '--sat-color': color, animationDelay: `${i * 0.08}s` }}>
              <div className="pp-heart-shape" style={{ background: color, width: isMobile ? '24px' : '36px', height: isMobile ? '24px' : '36px', boxShadow: `0 0 20px ${color}, 0 0 40px ${color}80` }} />
            </div>
          ))}
          {heartBurst.map((heart) => {
            const x = Math.cos(heart.angle) * heart.distance;
            const y = Math.sin(heart.angle) * heart.distance;
            return (
              <div key={heart.id} className="pp-spiral-heart" style={{ '--x': `${x}px`, '--y': `${y}px`, '--start-rotation': `${heart.rotation}deg`, fontSize: `${heart.size}rem`, animationDelay: `${heart.delay}ms`, filter: `drop-shadow(0 0 20px ${heart.color})`, color: heart.color }}>
                {heart.type}
              </div>
            );
          })}
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '1px', height: '1px' }}>
            {orbitalHearts.map((orbit) => (
              <div key={orbit.id} className="pp-orbital-heart" style={{ '--radius': `${orbit.radius}px`, '--speed': orbit.speed, '--start-angle': `${orbit.startAngle}rad`, fontSize: `${orbit.size}rem`, animationDelay: `${orbit.delay}ms` }}>💖</div>
            ))}
          </div>
          {explosionParticles.map((p) => (
            <div key={p.id} className="pp-particle" style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, width: `${p.size}px`, height: `${p.size}px`, background: p.color, animationDelay: `${p.delay}ms`, boxShadow: `0 0 ${p.size * 2}px ${p.color}` }} />
          ))}
          {[...Array(isMobile ? 15 : 25)].map((_, i) => {
            const angle = (Math.PI * 2 * i) / (isMobile ? 15 : 25);
            const dist = 120 + Math.random() * 100;
            return (
              <div key={`sparkle-${i}`} className="pp-spiral-heart" style={{ '--x': `${Math.cos(angle) * dist}px`, '--y': `${Math.sin(angle) * dist}px`, '--start-rotation': `${Math.random() * 360}deg`, fontSize: '2rem', animationDelay: `${i * 40}ms`, filter: 'drop-shadow(0 0 15px rgba(255,255,255,1))' }}>
                {['✨', '⭐', '💫', '🌟'][i % 4]}
              </div>
            );
          })}
          <div className="pp-center-glow" />
        </div>
      )}

      {/* Reaction animations */}
      {Object.entries(reactionAnimations).map(([key, { emoji }]) => (
        <div key={key} className="pp-reaction-pop" style={{ fontSize: isMobile ? '2rem' : '4rem' }}>{emoji}</div>
      ))}

      {/* Share tooltip */}
      {showShareTooltip && (
        <div className="pp-share-toast">✨ Link copied to clipboard!</div>
      )}

      {/* Main article wrapper */}
      <div className="pp-outer">

        {/* Article card */}
        <article className="pp-article-card">
          <div className="pp-article-top-line" />

          {/* Header */}
          <header className="pp-article-header">
            <div className="pp-article-eyebrow">
              <span className="pp-eyebrow-dot" />
              {post.published ? 'Published Article' : 'Draft'}
              <span className="pp-eyebrow-dot" />
            </div>

            <h1 className="pp-title">{post.title}</h1>

            <div className="pp-meta-row">
              <div className="pp-meta-item">
                <span className="pp-meta-icon">📅</span>
                <span>{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="pp-meta-item">
                <span className="pp-meta-icon">❤️</span>
                <span>{post.likes || 0} likes</span>
              </div>
              <div className="pp-meta-item">
                <span className="pp-meta-icon">💬</span>
                <span>{post.comments?.length || 0} comments</span>
              </div>
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="pp-cover-wrap">
              <img src={post.coverImage} alt={post.title} className="pp-cover-img" />
              <div className="pp-cover-overlay" />
            </div>
          )}

          {/* Content */}
          <div className="pp-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Tags */}
          {post.tags && (
            <div className="pp-tags-row">
              {(Array.isArray(post.tags) ? post.tags : post.tags.split(',')).map((tag, i) => (
                <span key={i} className="pp-tag">{tag.trim()}</span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="pp-section-divider">
            <span className="pp-divider-line" />
            <span className="pp-divider-diamond">◇</span>
            <span className="pp-divider-line" />
          </div>

          {/* Like button */}
          <div className="pp-like-wrap">
            <button
              onClick={handleLike}
              className={`pp-like-btn ${post.liked ? 'pp-like-btn-active' : ''}`}
            >
              <span className="pp-like-icon">{post.liked ? '❤️' : '🤍'}</span>
              <span className="pp-like-text">{post.liked ? `Liked` : `Like this post`}</span>
              <span className="pp-like-count">{post.likes || 0}</span>
              <span className="pp-like-glow" />
            </button>
          </div>

          {/* Share Section */}
          <div className="pp-share-section">
            <div className="pp-share-heading">
              <span className="pp-share-line" />
              <h3 className="pp-share-title">Share this story</h3>
              <span className="pp-share-line" />
            </div>

            {isMobile ? (
              <div className="pp-share-mobile-grid">
                {sharePlatforms.slice(0, 6).map((platform) => (
                  <button
                    key={platform.platform}
                    onClick={platform.action}
                    className="pp-share-mobile-btn"
                    style={{ '--platform-color': platform.color }}
                    title={platform.label}
                  >
                    <span className="pp-share-mobile-icon">{platform.mobileIcon}</span>
                    <span className="pp-share-mobile-label">{platform.label}</span>
                  </button>
                ))}
                <button onClick={copyToClipboard} className="pp-share-mobile-btn" style={{ '--platform-color': '#9C27B0' }} title="Copy Link">
                  <span className="pp-share-mobile-icon">📋</span>
                  <span className="pp-share-mobile-label">Copy</span>
                </button>
                <button onClick={shareViaEmail} className="pp-share-mobile-btn" style={{ '--platform-color': '#EA4335' }} title="Email">
                  <span className="pp-share-mobile-icon">✉️</span>
                  <span className="pp-share-mobile-label">Email</span>
                </button>
                <button onClick={shareViaReddit} className="pp-share-mobile-btn" style={{ '--platform-color': '#FF4500' }} title="Reddit">
                  <span className="pp-share-mobile-icon">👾</span>
                  <span className="pp-share-mobile-label">Reddit</span>
                </button>
              </div>
            ) : (
              <div className="pp-share-galaxy">
                <div className="pp-galaxy-core">
                  <span className="pp-galaxy-icon">✦</span>
                  <span className="pp-galaxy-label">Share</span>
                </div>
                <div className="pp-galaxy-ring pp-ring-1" />
                <div className="pp-galaxy-ring pp-ring-2" />
                {sharePlatforms.map((platform, index) => {
                  const angle = (index / sharePlatforms.length) * 360;
                  const distance = 130;
                  const x = Math.cos((angle * Math.PI) / 180) * distance;
                  const y = Math.sin((angle * Math.PI) / 180) * distance;
                  const isHov = hoveredShare === platform.platform;
                  return (
                    <button
                      key={platform.platform}
                      onClick={platform.action}
                      onMouseEnter={() => setHoveredShare(platform.platform)}
                      onMouseLeave={() => setHoveredShare(null)}
                      className={`pp-galaxy-btn ${isHov ? 'pp-galaxy-btn-hov' : ''}`}
                      style={{
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        '--platform-color': platform.color
                      }}
                      title={platform.label}
                    >
                      <span className="pp-galaxy-btn-icon">{isHov ? platform.hoverIcon : platform.icon}</span>
                      {isHov && <span className="pp-galaxy-btn-tooltip">{platform.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <section className="pp-comments-card">
          <div className="pp-comments-top-line" />

          <div className="pp-comments-header">
            <div className="pp-comments-eyebrow">DISCUSSION</div>
            <h3 className="pp-comments-title">
              Comments
              <span className="pp-comments-count">{post.comments?.length || 0}</span>
            </h3>
          </div>

          {(!post.comments || post.comments.length === 0) && (
            <div className="pp-no-comments">
              <div className="pp-no-comments-icon">💭</div>
              <p className="pp-no-comments-text">No comments yet — be the first to share your thoughts.</p>
            </div>
          )}

          <div className="pp-comments-list">
            {post.comments && post.comments.map((c, index) => {
              const commentId = c._id || `comment-${index}`;
              const isHov = hoveredComment === commentId;
              return (
                <div
                  key={commentId}
                  className={`pp-comment-card ${isHov ? 'pp-comment-hov' : ''}`}
                  onMouseEnter={() => !isMobile && setHoveredComment(commentId)}
                  onMouseLeave={() => !isMobile && setHoveredComment(null)}
                >
                  <div className="pp-comment-top-accent" />
                  <div className="pp-comment-head">
                    <div className="pp-comment-avatar">
                      {(c.authorName || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="pp-comment-meta">
                      <strong className="pp-comment-author">{c.authorName || 'Guest'}</strong>
                      <small className="pp-comment-date">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </small>
                    </div>
                  </div>

                  <p className="pp-comment-text">{c.text || c.content || String(c)}</p>

                  <div className="pp-reactions-row">
                    {[
                      { type: 'like', emoji: '👍', label: 'Like' },
                      { type: 'love', emoji: '❤️', label: 'Love' },
                      { type: 'celebrate', emoji: '🎉', label: 'Celebrate' },
                    ].map(({ type, emoji, label }) => (
                      <button
                        key={type}
                        className={`pp-reaction-btn ${hasUserReacted(commentId, type) ? 'pp-reaction-active' : ''}`}
                        onClick={() => handleCommentReaction(commentId, type, emoji)}
                      >
                        {emoji} {label}
                        {commentReactions[`${commentId}-${type}`] > 0 && (
                          <span className="pp-reaction-count">
                            {commentReactions[`${commentId}-${type}`]}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comment form */}
          <div className="pp-comment-form-wrap">
            <div className="pp-form-heading">Leave a comment</div>
            <form onSubmit={submitComment} className="pp-comment-form">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts and join the conversation…"
                className="pp-textarea"
                rows={isMobile ? 4 : 5}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`pp-submit-btn ${commentText.trim() ? 'pp-submit-active' : ''}`}
              >
                <span className="pp-submit-glow" />
                <span className="pp-submit-text">💬 Post Comment</span>
              </button>
            </form>
          </div>
        </section>

        {/* Footer strip */}
        <div className="pp-footer">
          <span className="pp-footer-text">Brandscapers Africa · Shaping the Narrative</span>
        </div>
      </div>
    </div>
  );
}

const ppStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

  :root {
    --pp-navy: #04101f;
    --pp-navy-dark: #0a1929;
    --pp-navy-mid: #0d2347;
    --pp-blue-deep: #1338be;
    --pp-blue-mid: #1a5fdb;
    --pp-blue-vivid: #2979ff;
    --pp-blue-light: #5c9fff;
    --pp-blue-pale: #90c9ff;
    --pp-glass: rgba(255,255,255,0.10);
    --pp-glass-border: rgba(255,255,255,0.18);
    --pp-white: #ffffff;
    --pp-text: rgba(255,255,255,0.92);
    --pp-text-muted: rgba(180,215,255,0.75);
    --pp-font-display: 'Cormorant Garamond', Georgia, serif;
    --pp-font-body: 'Outfit', system-ui, sans-serif;
    --pp-ease: cubic-bezier(0.4, 0, 0.2, 1);
    --pp-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ROOT */
  .pp-root {
    min-height: 100vh;
    font-family: var(--pp-font-body);
    position: relative;
    overflow-x: hidden;
  }

  /* PROGRESS BAR */
  .pp-progress-bar {
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--pp-blue-deep), var(--pp-blue-vivid), var(--pp-blue-pale));
    z-index: 9999;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px rgba(41,121,255,0.6);
  }

  /* BACKGROUNDS */
  .pp-bg-base {
    position: fixed; inset: 0; z-index: 0;
    background: linear-gradient(
      160deg,
      var(--pp-navy) 0%,
      var(--pp-navy-dark) 18%,
      var(--pp-navy-mid) 38%,
      #0f3264 55%,
      #1a5fdb 75%,
      #3a7fd4 88%,
      #6fb3e8 100%
    );
  }

  .pp-bg-noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  .pp-bg-orb {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
    filter: blur(100px);
    animation: pp-orb-float 20s ease-in-out infinite alternate;
  }
  .pp-orb-1 { width: 600px; height: 600px; top: -150px; right: -100px; background: radial-gradient(circle, rgba(41,121,255,0.2), transparent 70%); }
  .pp-orb-2 { width: 450px; height: 450px; bottom: -100px; left: -100px; background: radial-gradient(circle, rgba(10,22,40,0.5), transparent 70%); animation-delay: -7s; }
  .pp-orb-3 { width: 350px; height: 350px; top: 40%; left: 25%; background: radial-gradient(circle, rgba(92,159,255,0.12), transparent 70%); animation-delay: -14s; }

  @keyframes pp-orb-float {
    0% { transform: translate(0,0) scale(1); }
    50% { transform: translate(30px,-25px) scale(1.08); }
    100% { transform: translate(-20px,30px) scale(0.93); }
  }

  .pp-bg-lines {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.035;
    background-image:
      linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* LOADING */
  .pp-loading {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 100vh; gap: 2rem;
  }
  .pp-loading-ring { display: inline-block; position: relative; width: 64px; height: 64px; }
  .pp-loading-ring div {
    box-sizing: border-box; display: block; position: absolute;
    width: 52px; height: 52px; margin: 6px;
    border: 3px solid transparent; border-radius: 50%;
    animation: pp-ring-spin 1.3s cubic-bezier(0.5,0,0.5,1) infinite;
  }
  .pp-loading-ring div:nth-child(1) { border-top-color: var(--pp-blue-vivid); animation-delay: -0.45s; }
  .pp-loading-ring div:nth-child(2) { border-top-color: var(--pp-blue-light); animation-delay: -0.3s; }
  .pp-loading-ring div:nth-child(3) { border-top-color: var(--pp-blue-pale); animation-delay: -0.15s; }
  .pp-loading-ring div:nth-child(4) { border-top-color: rgba(255,255,255,0.2); }

  @keyframes pp-ring-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  .pp-loading-text { color: var(--pp-blue-pale); font-size: 0.85rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; }

  /* OUTER LAYOUT */
  .pp-outer {
    position: relative; z-index: 1;
    max-width: 860px;
    margin: 0 auto;
    padding: clamp(1.5rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2rem) 0;
    display: flex; flex-direction: column; gap: clamp(1.5rem, 4vw, 2.5rem);
  }

  /* ARTICLE CARD */
  .pp-article-card {
    position: relative;
    background: linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.06) 100%);
    backdrop-filter: blur(60px) saturate(180%);
    -webkit-backdrop-filter: blur(60px) saturate(180%);
    border-radius: clamp(20px, 4vw, 36px);
    border: 1px solid var(--pp-glass-border);
    overflow: hidden;
    box-shadow:
      0 40px 100px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.22);
  }

  .pp-article-top-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--pp-blue-deep), var(--pp-blue-vivid), var(--pp-blue-light), var(--pp-blue-vivid), var(--pp-blue-deep), transparent);
    animation: pp-shimmer 4s ease-in-out infinite;
  }

  @keyframes pp-shimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

  .pp-article-header { padding: clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 5vw, 3.5rem) clamp(1.5rem, 3vw, 2.5rem); }

  .pp-article-eyebrow {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 0.62rem; font-weight: 800; letter-spacing: 4px; text-transform: uppercase;
    color: var(--pp-blue-pale); opacity: 0.8;
    margin-bottom: 1.25rem;
  }

  .pp-eyebrow-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--pp-blue-vivid);
    animation: pp-dot-pulse 2s ease-in-out infinite;
  }

  @keyframes pp-dot-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  .pp-title {
    font-family: var(--pp-font-display);
    font-size: clamp(1.9rem, 5.5vw, 3.5rem);
    font-weight: 700;
    font-style: italic;
    color: var(--pp-white);
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
    word-break: break-word;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .pp-meta-row {
    display: flex; flex-wrap: wrap; gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .pp-meta-item {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.8rem; font-weight: 500;
    color: var(--pp-text-muted);
  }
  .pp-meta-icon { font-size: 0.85rem; }

  /* Cover image */
  .pp-cover-wrap {
    position: relative; overflow: hidden;
    margin: 0 clamp(1.5rem, 5vw, 3.5rem);
    border-radius: clamp(12px, 2vw, 20px);
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }
  .pp-cover-img { width: 100%; height: auto; display: block; border-radius: inherit; }
  .pp-cover-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 60%, rgba(4,16,31,0.4));
    border-radius: inherit;
    pointer-events: none;
  }

  /* Article content */
  .pp-content {
    padding: 0 clamp(1.5rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2.5rem);
    color: rgba(230,242,255,0.92);
    font-size: clamp(1rem, 2vw, 1.1rem);
    line-height: 1.85;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  .pp-content h1, .pp-content h2, .pp-content h3, .pp-content h4 {
    font-family: var(--pp-font-display);
    color: var(--pp-white);
    margin: 2rem 0 1rem;
    line-height: 1.2;
    font-style: italic;
  }
  .pp-content h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); }
  .pp-content h2 { font-size: clamp(1.5rem, 3.5vw, 2.2rem); }
  .pp-content h3 { font-size: clamp(1.2rem, 3vw, 1.7rem); }
  .pp-content p { margin-bottom: 1.25rem; }
  .pp-content a { color: var(--pp-blue-pale); text-decoration: underline; text-underline-offset: 3px; }
  .pp-content img { max-width: 100%; border-radius: clamp(8px, 2vw, 16px); margin: 1.5rem 0; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
  .pp-content blockquote {
    border-left: 3px solid var(--pp-blue-vivid);
    padding: 1rem 1.5rem;
    margin: 2rem 0;
    background: rgba(41,121,255,0.08);
    border-radius: 0 12px 12px 0;
    font-style: italic; color: var(--pp-text-muted);
  }
  .pp-content code {
    background: rgba(41,121,255,0.15);
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    color: var(--pp-blue-pale);
  }
  .pp-content ul, .pp-content ol { padding-left: 1.75rem; margin-bottom: 1.25rem; }
  .pp-content li { margin-bottom: 0.5rem; }

  /* Tags */
  .pp-tags-row {
    display: flex; flex-wrap: wrap; gap: 0.5rem;
    padding: 0 clamp(1.5rem, 5vw, 3.5rem);
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  }
  .pp-tag {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--pp-blue-pale);
    background: rgba(41,121,255,0.15);
    border: 1px solid rgba(41,121,255,0.25);
    border-radius: 20px;
    padding: 0.3rem 0.85rem;
    transition: all 0.25s;
  }
  .pp-tag:hover { background: rgba(41,121,255,0.3); border-color: rgba(41,121,255,0.5); }

  /* Section divider */
  .pp-section-divider {
    display: flex; align-items: center; gap: 1rem;
    padding: 0 clamp(1.5rem, 5vw, 3.5rem);
    margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  }
  .pp-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); }
  .pp-divider-diamond { color: rgba(144,201,255,0.4); font-size: 0.75rem; }

  /* Like button */
  .pp-like-wrap {
    display: flex; justify-content: center;
    padding: 0 clamp(1.5rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2.5rem);
  }

  .pp-like-btn {
    position: relative; overflow: hidden;
    display: flex; align-items: center; gap: 0.75rem;
    padding: clamp(0.9rem, 2vw, 1.1rem) clamp(2rem, 4vw, 3rem);
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(20px);
    color: var(--pp-white);
    font-family: var(--pp-font-body);
    font-size: clamp(0.9rem, 2vw, 1rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.35s var(--pp-ease);
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }

  .pp-like-btn:hover {
    transform: translateY(-4px) scale(1.04);
    border-color: rgba(255,107,157,0.5);
    box-shadow: 0 20px 50px rgba(255,107,157,0.25);
  }

  .pp-like-btn-active {
    background: linear-gradient(135deg, #ff6b9d, #ff2e63);
    border-color: rgba(255,107,157,0.6);
    box-shadow: 0 15px 40px rgba(255,107,157,0.35);
  }

  .pp-like-icon { font-size: 1.3rem; transition: transform 0.3s var(--pp-ease-spring); }
  .pp-like-btn:hover .pp-like-icon { transform: scale(1.3); }
  .pp-like-text { font-weight: 600; }
  .pp-like-count {
    background: rgba(255,255,255,0.2);
    padding: 0.15rem 0.6rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 800;
  }

  .pp-like-glow {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  .pp-like-btn:hover .pp-like-glow { transform: translateX(100%); }

 /* SHARE SECTION - Mobile Optimized */
.pp-share-section {
  padding: 0 clamp(1.5rem, 5vw, 3.5rem) clamp(2rem, 5vw, 3rem);
}

.pp-share-heading {
  display: flex; align-items: center; gap: 1.25rem;
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
}
.pp-share-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); }
.pp-share-title {
  font-family: var(--pp-font-display);
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  font-weight: 600; font-style: italic;
  color: var(--pp-text-muted);
  white-space: nowrap;
}

/* Mobile share grid - Improved */
.pp-share-mobile-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.pp-share-mobile-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.6rem 0.4rem;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--platform-color) 40%, transparent);
  background: color-mix(in srgb, var(--platform-color) 15%, rgba(255,255,255,0.05));
  color: var(--pp-white);
  cursor: pointer;
  transition: all 0.25s var(--pp-ease);
  font-family: var(--pp-font-body);
  min-width: 65px;
  flex: 0 1 auto;
}

.pp-share-mobile-icon { 
  font-size: 1.2rem; 
}

.pp-share-mobile-label { 
  font-size: 0.55rem; 
  font-weight: 700; 
  letter-spacing: 0.3px; 
  opacity: 0.85;
  white-space: nowrap;
}

/* Galaxy share (desktop) - Hide on mobile */
.pp-share-galaxy {
  position: relative;
  height: 320px;
  display: flex; align-items: center; justify-content: center;
}

/* Mobile Responsive Improvements */
@media (max-width: 768px) {
  .pp-outer { 
    padding: 1rem 1rem 0; 
    gap: 1.25rem; 
  }
  
  .pp-article-header { 
    padding: 1.75rem 1.25rem 1.25rem; 
  }
  
  .pp-title {
    font-size: clamp(1.5rem, 5vw, 2.2rem);
  }
  
  .pp-content { 
    padding: 0 1.25rem 1.5rem; 
    font-size: 0.95rem;
  }
  
  .pp-content h1 { font-size: 1.8rem; }
  .pp-content h2 { font-size: 1.5rem; }
  .pp-content h3 { font-size: 1.2rem; }
  
  .pp-tags-row, 
  .pp-section-divider, 
  .pp-like-wrap, 
  .pp-share-section { 
    padding-left: 1.25rem; 
    padding-right: 1.25rem; 
  }
  
  .pp-cover-wrap { 
    margin: 0 1.25rem; 
    margin-bottom: 1.5rem; 
  }
  
  .pp-comments-header { 
    padding: 1.5rem 1.25rem 0.75rem; 
  }
  
  .pp-comments-list { 
    padding: 0 1.25rem; 
  }
  
  .pp-comment-form-wrap { 
    padding: 1.25rem; 
  }
  
  .pp-share-galaxy { 
    display: none; 
  }
  
  .pp-share-mobile-grid {
    gap: 0.4rem;
  }
  
  .pp-share-mobile-btn {
    min-width: 55px;
    padding: 0.5rem 0.3rem;
  }
  
  .pp-share-mobile-icon {
    font-size: 1rem;
  }
  
  .pp-share-mobile-label {
    font-size: 0.5rem;
  }
  
  /* Comment reactions mobile */
  .pp-reactions-row {
    gap: 0.4rem;
  }
  
  .pp-reaction-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
  }
  
  .pp-comment-card {
    padding: 1rem;
  }
  
  .pp-comment-text {
    font-size: 0.85rem;
  }
  
  .pp-comment-avatar {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
  
  .pp-comment-author {
    font-size: 0.8rem;
  }
  
  .pp-comment-date {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .pp-outer {
    padding: 0.75rem 0.75rem 0;
  }
  
  .pp-article-header {
    padding: 1.25rem 1rem 1rem;
  }
  
  .pp-title {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  
  .pp-meta-row {
    gap: 0.5rem;
    font-size: 0.7rem;
  }
  
  .pp-meta-item {
    font-size: 0.7rem;
  }
  
  .pp-content {
    padding: 0 1rem 1.25rem;
    font-size: 0.9rem;
    line-height: 1.7;
  }
  
  .pp-content h1 { font-size: 1.5rem; }
  .pp-content h2 { font-size: 1.3rem; }
  .pp-content h3 { font-size: 1.1rem; }
  
  .pp-content p {
    margin-bottom: 1rem;
  }
  
  .pp-content blockquote {
    padding: 0.75rem 1rem;
    margin: 1.5rem 0;
    font-size: 0.9rem;
  }
  
  .pp-tags-row {
    gap: 0.3rem;
    margin-bottom: 1.5rem;
  }
  
  .pp-tag {
    font-size: 0.55rem;
    padding: 0.2rem 0.6rem;
  }
  
  .pp-section-divider {
    margin-bottom: 1.5rem;
  }
  
  /* Like button mobile */
  .pp-like-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.8rem;
    gap: 0.5rem;
  }
  
  .pp-like-icon {
    font-size: 1rem;
  }
  
  .pp-like-count {
    font-size: 0.7rem;
  }
  
  /* Share buttons mobile - even smaller */
  .pp-share-mobile-grid {
    gap: 0.3rem;
  }
  
  .pp-share-mobile-btn {
    min-width: 48px;
    padding: 0.4rem 0.2rem;
  }
  
  .pp-share-mobile-icon {
    font-size: 0.9rem;
  }
  
  .pp-share-mobile-label {
    font-size: 0.45rem;
    letter-spacing: 0.2px;
  }
  
  /* Comments section mobile */
  .pp-comments-header {
    padding: 1.25rem 1rem 0.5rem;
  }
  
  .pp-comments-title {
    font-size: 1.2rem;
    gap: 0.5rem;
  }
  
  .pp-comments-count {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
  }
  
  .pp-comments-list {
    padding: 0 1rem;
  }
  
  .pp-comment-card {
    padding: 0.9rem;
  }
  
  .pp-comment-head {
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }
  
  .pp-comment-avatar {
    width: 26px;
    height: 26px;
    font-size: 0.7rem;
  }
  
  .pp-comment-author {
    font-size: 0.75rem;
  }
  
  .pp-comment-date {
    font-size: 0.6rem;
  }
  
  .pp-comment-text {
    font-size: 0.8rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }
  
  .pp-reactions-row {
    gap: 0.3rem;
    padding-top: 0.6rem;
  }
  
  .pp-reaction-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
    gap: 0.2rem;
  }
  
  .pp-reaction-count {
    padding: 0.05rem 0.3rem;
    font-size: 0.6rem;
  }
  
  /* Comment form mobile */
  .pp-comment-form-wrap {
    padding: 1rem;
  }
  
  .pp-form-heading {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .pp-textarea {
    padding: 0.8rem;
    font-size: 0.8rem;
    min-height: 80px;
  }
  
  .pp-submit-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.8rem;
  }
  
  /* Footer mobile */
  .pp-footer {
    padding: 1rem;
  }
  
  .pp-footer-text {
    font-size: 0.55rem;
    letter-spacing: 3px;
  }
}

@media (max-width: 360px) {
  .pp-title {
    font-size: 1.2rem;
  }
  
  .pp-meta-row {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
  }
  
  .pp-meta-item {
    font-size: 0.65rem;
  }
  
  .pp-content {
    font-size: 0.85rem;
  }
  
  .pp-content h1 { font-size: 1.3rem; }
  .pp-content h2 { font-size: 1.1rem; }
  .pp-content h3 { font-size: 1rem; }
  
  /* Share buttons - scrollable row on very small screens */
  .pp-share-mobile-grid {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--pp-blue-pale) transparent;
    justify-content: flex-start;
  }
  
  .pp-share-mobile-grid::-webkit-scrollbar {
    height: 3px;
  }
  
  .pp-share-mobile-grid::-webkit-scrollbar-thumb {
    background-color: var(--pp-blue-pale);
    border-radius: 10px;
  }
  
  .pp-share-mobile-btn {
    min-width: 45px;
    padding: 0.35rem 0.15rem;
  }
  
  .pp-share-mobile-icon {
    font-size: 0.85rem;
  }
  
  .pp-share-mobile-label {
    font-size: 0.4rem;
  }
  
  /* Comment reactions - stack on very small */
  .pp-reactions-row {
    flex-direction: column;
    gap: 0.2rem;
  }
  
  .pp-reaction-btn {
    width: 100%;
    justify-content: center;
  }
}

  .pp-reaction-btn {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.4rem 0.85rem;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(10px);
    color: var(--pp-white);
    font-family: var(--pp-font-body);
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s var(--pp-ease);
    white-space: nowrap;
  }

  .pp-reaction-btn:hover {
    background: rgba(41,121,255,0.2);
    border-color: rgba(41,121,255,0.35);
    transform: translateY(-2px);
  }

  .pp-reaction-active {
    background: rgba(41,121,255,0.25);
    border-color: rgba(41,121,255,0.5);
    box-shadow: 0 4px 15px rgba(41,121,255,0.2);
  }

  .pp-reaction-count {
    background: rgba(255,255,255,0.15);
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    font-size: 0.72em;
    font-weight: 800;
  }

  /* Comment form */
  .pp-comment-form-wrap {
    padding: clamp(1.5rem, 4vw, 2.5rem);
    border-top: 1px solid rgba(255,255,255,0.08);
    margin-top: 1.5rem;
  }

  .pp-form-heading {
    font-family: var(--pp-font-display);
    font-size: 1.1rem; font-weight: 600; font-style: italic;
    color: var(--pp-text-muted);
    margin-bottom: 1.25rem;
  }

  .pp-comment-form { display: flex; flex-direction: column; gap: 1rem; }

  .pp-textarea {
    width: 100%;
    padding: clamp(1rem, 2.5vw, 1.4rem);
    border-radius: clamp(12px, 2vw, 18px);
    border: 1.5px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    color: var(--pp-white);
    font-family: var(--pp-font-body);
    font-size: clamp(0.9rem, 2vw, 1rem);
    line-height: 1.6;
    resize: vertical;
    transition: all 0.25s var(--pp-ease);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
    min-height: 100px;
  }

  .pp-textarea::placeholder { color: rgba(144,201,255,0.4); }
  .pp-textarea:focus {
    outline: none;
    border-color: rgba(41,121,255,0.5);
    background: rgba(255,255,255,0.10);
    box-shadow: 0 0 0 3px rgba(41,121,255,0.12), 0 4px 20px rgba(0,0,0,0.2);
  }

  .pp-submit-btn {
    position: relative; overflow: hidden;
    padding: clamp(0.85rem, 2.5vw, 1.1rem) 2rem;
    border-radius: 50px;
    border: 1.5px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.5);
    font-family: var(--pp-font-body);
    font-size: clamp(0.9rem, 2vw, 1rem);
    font-weight: 700;
    cursor: not-allowed;
    transition: all 0.3s var(--pp-ease);
    width: 100%;
  }

  .pp-submit-active {
    background: linear-gradient(135deg, var(--pp-navy-mid), var(--pp-blue-deep), var(--pp-blue-mid));
    border-color: rgba(41,121,255,0.4);
    color: var(--pp-white);
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(10,22,40,0.4);
  }

  .pp-submit-active:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(10,22,40,0.5);
  }

  .pp-submit-glow {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  .pp-submit-active:hover .pp-submit-glow { transform: translateX(100%); }
  .pp-submit-text { position: relative; z-index: 1; }

  /* HEART ANIMATION CANVAS */
  .pp-heart-canvas {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    pointer-events: none; z-index: 9999;
  }

  .pp-shockwave {
    position: absolute; top: 50%; left: 50%;
    width: 200px; height: 200px;
    border-style: solid;
    border-radius: 50%;
    animation: pp-shockwave 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes pp-shockwave {
    0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
    20%  { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
    50%  { opacity: 0.7; }
    100% { transform: translate(-50%,-50%) scale(6); opacity: 0; }
  }

  .pp-energy-ring {
    position: absolute; top: 50%; left: 50%;
    width: 180px; height: 180px;
    border: 3px dashed rgba(255,107,157,0.6);
    border-radius: 50%;
    animation: pp-energy 2s ease-out forwards;
  }

  @keyframes pp-energy {
    0% { transform: translate(-50%,-50%) scale(0.3) rotate(0deg); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translate(-50%,-50%) scale(3.5) rotate(180deg); opacity: 0; }
  }

  /* CSS Heart Shape */
  .pp-heart-shape {
    position: relative;
    width: 100%; height: 100%;
    background: #ff1744;
    transform: rotate(-45deg);
    border-radius: 0;
  }
  .pp-heart-shape::before,
  .pp-heart-shape::after {
    content: ''; position: absolute;
    width: 100%; height: 100%;
    background: inherit;
    border-radius: 50%;
  }
  .pp-heart-shape::before { top: -50%; left: 0; }
  .pp-heart-shape::after { top: 0; left: 50%; }

  /* Screen flash on like */
  .pp-screen-flash {
    position: fixed; inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255,50,100,0.25), transparent 70%);
    animation: pp-flash 0.6s ease-out forwards;
    pointer-events: none;
  }
  @keyframes pp-flash {
    0% { opacity: 0; }
    15% { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Rainbow heart - main center piece */
  .pp-main-heart {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation: pp-quantum 3.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    will-change: transform, opacity;
    z-index: 10;
  }

  .pp-rainbow-heart {
    animation: pp-rainbow-color 0.4s linear infinite, pp-heart-throb 0.3s ease-in-out infinite alternate !important;
    box-shadow:
      0 0 40px currentColor,
      0 0 80px currentColor,
      0 0 120px rgba(255,100,150,0.6);
  }
  .pp-rainbow-heart::before, .pp-rainbow-heart::after {
    background: inherit;
  }

  @keyframes pp-rainbow-color {
    0%   { background: #ff0055; }
    20%  { background: #ff6600; }
    40%  { background: #ffdd00; }
    60%  { background: #00ff99; }
    80%  { background: #6644ff; }
    100% { background: #ff0055; }
  }

  @keyframes pp-heart-throb {
    0%   { transform: rotate(-45deg) scale(1); }
    100% { transform: rotate(-45deg) scale(1.12); }
  }

  @keyframes pp-quantum {
    0%   { transform: translate(-50%,-50%) scale(0) rotate(0deg); opacity: 0; }
    8%   { transform: translate(-50%,-50%) scale(1.4) rotate(-20deg); opacity: 1; }
    15%  { transform: translate(-50%,-50%) scale(2.8) rotate(15deg); opacity: 1; }
    30%  { transform: translate(-50%,-50%) scale(2.5) rotate(-10deg); opacity: 1; }
    50%  { transform: translate(-50%,-50%) scale(2.7) rotate(8deg); opacity: 0.95; }
    70%  { transform: translate(-50%,-50%) scale(2.3) rotate(-5deg); opacity: 0.8; }
    90%  { transform: translate(-50%,-50%) scale(1.5) rotate(3deg); opacity: 0.4; }
    100% { transform: translate(-50%,-50%) scale(0) rotate(0deg); opacity: 0; }
  }

  /* Rainbow expanding rings */
  .pp-rainbow-ring {
    position: absolute; top: 50%; left: 50%;
    width: 160px; height: 160px;
    border: 3px solid;
    border-radius: 50%;
    animation: pp-rainbow-expand 1.8s cubic-bezier(0.2, 0.8, 0.4, 1) forwards;
  }
  @keyframes pp-rainbow-expand {
    0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
    60%  { opacity: 0.8; }
    100% { transform: translate(-50%,-50%) scale(5); opacity: 0; }
  }

  /* Satellite hearts orbiting outward */
  .pp-satellite-heart {
    position: absolute; top: 50%; left: 50%;
    transform-origin: 0 0;
    animation: pp-satellite-launch 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    --sat-angle: 0deg;
  }
  @keyframes pp-satellite-launch {
    0%   { transform: translate(-50%,-50%) rotate(var(--sat-angle)) translateX(0px) scale(0); opacity: 0; }
    15%  { opacity: 1; transform: translate(-50%,-50%) rotate(var(--sat-angle)) translateX(20px) scale(1.4); }
    60%  { opacity: 1; transform: translate(-50%,-50%) rotate(var(--sat-angle)) translateX(180px) scale(1); }
    100% { opacity: 0; transform: translate(-50%,-50%) rotate(var(--sat-angle)) translateX(280px) scale(0.2); }
  }

  .pp-spiral-heart {
    position: absolute; top: 50%; left: 50%;
    animation: pp-spiral 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    will-change: transform, opacity;
  }

  @keyframes pp-spiral {
    0% { opacity: 0; transform: translate(-50%,-50%) scale(0) rotate(0deg); }
    20% { opacity: 1; transform: translate(-50%,-50%) scale(1.3) rotate(var(--start-rotation)); }
    100% { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.1) rotate(calc(var(--start-rotation) + 720deg)); }
  }

  .pp-orbital-heart {
    position: absolute;
    animation: pp-orbital 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    will-change: transform, opacity;
  }

  @keyframes pp-orbital {
    0% { transform: rotate(var(--start-angle)) translateX(var(--radius)) rotate(calc(-1 * var(--start-angle))) scale(0); opacity: 0; }
    10% { opacity: 1; }
    100% { transform: rotate(calc(var(--start-angle) + 360deg * var(--speed))) translateX(var(--radius)) rotate(calc(-1 * (var(--start-angle) + 360deg * var(--speed)))) scale(0.3); opacity: 0; }
  }

  .pp-particle {
    position: absolute; top: 50%; left: 50%;
    border-radius: 50%;
    animation: pp-explode 1.5s ease-out forwards;
    will-change: transform, opacity;
  }

  @keyframes pp-explode {
    0% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
    100% { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0); }
  }

  .pp-center-glow {
    position: absolute; top: 50%; left: 50%;
    width: 400px; height: 400px;
    background: conic-gradient(
      rgba(255,0,85,0.5),
      rgba(255,102,0,0.5),
      rgba(255,221,0,0.5),
      rgba(0,255,153,0.5),
      rgba(102,68,255,0.5),
      rgba(255,0,85,0.5)
    );
    border-radius: 50%;
    transform: translate(-50%,-50%);
    animation: pp-glow-spin 3s ease-out forwards;
    filter: blur(40px);
  }
  @keyframes pp-glow-spin {
    0%   { transform: translate(-50%,-50%) scale(0) rotate(0deg); opacity: 0.9; }
    40%  { transform: translate(-50%,-50%) scale(1.5) rotate(180deg); opacity: 0.7; }
    100% { transform: translate(-50%,-50%) scale(3) rotate(360deg); opacity: 0; }
  }

  /* Reaction pop */
  .pp-reaction-pop {
    position: fixed; top: 50%; left: 50%;
    animation: pp-reaction-pop 1s ease-out forwards;
    pointer-events: none; z-index: 9999;
    filter: drop-shadow(0 0 20px rgba(255,255,255,0.8));
    transform: translate(-50%,-50%);
  }

  @keyframes pp-reaction-pop {
    0% { transform: translate(-50%,-50%) scale(0) rotate(0deg); opacity: 0; }
    50% { transform: translate(-50%,-50%) scale(1.5) rotate(15deg); opacity: 1; }
    100% { transform: translate(-50%, calc(-50% - 60px)) scale(0.3); opacity: 0; }
  }

  /* Share toast */
  .pp-share-toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(100,30,160,0.95), rgba(70,20,120,0.95));
    backdrop-filter: blur(20px);
    color: var(--pp-white);
    padding: 0.85rem 1.75rem;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
    z-index: 10000;
    font-size: 0.9rem; font-weight: 700;
    animation: pp-toast-in 0.3s var(--pp-ease-spring);
    white-space: nowrap;
  }

  @keyframes pp-toast-in {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }

  /* Footer */
  .pp-footer {
    text-align: center;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.15);
    backdrop-filter: blur(20px);
    border-radius: 0 0 24px 24px;
  }
  .pp-footer-text { font-size: 0.62rem; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.2); }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .pp-outer { padding: 1rem 1rem 0; gap: 1.25rem; }
    .pp-article-header { padding: 1.75rem 1.25rem 1.25rem; }
    .pp-content { padding: 0 1.25rem 1.5rem; }
    .pp-tags-row, .pp-section-divider, .pp-like-wrap, .pp-share-section { padding-left: 1.25rem; padding-right: 1.25rem; }
    .pp-cover-wrap { margin: 0 1.25rem; margin-bottom: 1.5rem; }
    .pp-comments-header { padding: 1.5rem 1.25rem 0.75rem; }
    .pp-comments-list { padding: 0 1.25rem; }
    .pp-comment-form-wrap { padding: 1.25rem; }
    .pp-share-galaxy { display: none; }
  }

  @media (max-width: 480px) {
    .pp-share-mobile-grid { grid-template-columns: repeat(3, 1fr); }
    .pp-reactions-row { gap: 0.35rem; }
    .pp-reaction-btn { padding: 0.35rem 0.65rem; font-size: 0.72rem; }
    .pp-meta-row { gap: 0.6rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;