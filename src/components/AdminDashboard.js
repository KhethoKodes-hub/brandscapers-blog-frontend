// client/src/components/AdminDashboard.js
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function AdminDashboard() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(true);
  const [files, setFiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [previewPost, setPreviewPost] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fontColor, setFontColor] = useState('#000000');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontStyle, setFontStyle] = useState('normal');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  // Initialize content when component mounts
  useEffect(() => {
    if (contentRef.current && content) {
      contentRef.current.innerHTML = content;
    }
  }, []);

  async function loadPosts() {
    try {
      setIsLoading(true);
      const res = await API.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFiles = (e) => {
    setFiles(e.target.files);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !slug || !content) return alert('Title, slug and content required');

    const token = localStorage.getItem('token');
    if (!token) return alert('You are not logged in as admin!');

    try {
      const form = new FormData();
      form.append('title', title);
      form.append('slug', slug);
      form.append('content', content);
      form.append('excerpt', content.replace(/<[^>]*>/g, '').slice(0, 200));
      form.append('tags', tags);
      form.append('published', published ? 'true' : 'false');

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          form.append('files', files[i]);
        }
      }

      const res = await API.post('/posts', form, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        } 
      });

      console.log('Post created:', res.data);
      alert('Post created successfully!');
      setTitle(''); setSlug(''); setContent(''); setTags(''); setFiles([]);
      if (contentRef.current) contentRef.current.innerHTML = '';
      loadPosts();
      setActiveTab('manage');
    } catch (err) {
      console.error('CREATE POST ERROR:', err.response?.data || err.message);
      alert('Failed to create post. Check console for details.');
    }
  };

  const formatText = (command, value = null) => {
    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        contentRef.current.focus();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand(command, false, value);
        updateContent();
        contentRef.current.focus();
      } else {
        contentRef.current.focus();
        document.execCommand(command, false, value);
        updateContent();
      }
    }
  };

  const insertHTML = (html) => {
    if (contentRef.current) {
      contentRef.current.focus();
      document.execCommand('insertHTML', false, html);
      updateContent();
    }
  };

  const updateContent = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const handleContentInput = (e) => {
    setContent(e.currentTarget.innerHTML);
  };

  const togglePreview = () => {
    if (isPreviewMode) {
      if (contentRef.current) {
        contentRef.current.innerHTML = content;
      }
    }
    setIsPreviewMode(!isPreviewMode);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await API.delete(`/posts/${id}`);
        alert('Post deleted successfully');
        loadPosts();
      } catch (err) {
        console.error(err);
        alert('Failed to delete post');
      }
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      await API.put(`/posts/${post._id}`, { published: !post.published });
      alert(`Post ${!post.published ? 'published' : 'unpublished'} successfully`);
      loadPosts();
    } catch (err) {
      console.error(err);
      alert('Failed to update post status');
    }
  };

  const handlePreview = (post) => {
    setPreviewPost(post);
    setActiveTab('preview');
  };

  // New font and styling functions
  const handleFontColorChange = (e) => {
    const color = e.target.value;
    setFontColor(color);
    formatText('foreColor', color);
  };

  const handleLineSpacingChange = (e) => {
    const spacing = e.target.value;
    setLineSpacing(spacing);
    
    let lineHeightValue = 'normal';
    switch(spacing) {
      case 'single':
        lineHeightValue = '1';
        break;
      case '1.5':
        lineHeightValue = '1.5';
        break;
      case 'double':
        lineHeightValue = '2';
        break;
      default:
        lineHeightValue = 'normal';
    }
    
    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.lineHeight = lineHeightValue;
        range.surroundContents(span);
        updateContent();
      }
    }
  };

  const handleFontFamilyChange = (e) => {
    const font = e.target.value;
    setFontFamily(font);
    formatText('fontName', font);
  };

  const handleFontStyleChange = (e) => {
    const style = e.target.value;
    setFontStyle(style);
    
    switch(style) {
      case 'normal':
        formatText('removeFormat');
        break;
      case 'bold':
        formatText('bold');
        break;
      case 'italic':
        formatText('italic');
        break;
      case 'underline':
        formatText('underline');
        break;
      case 'strikethrough':
        formatText('strikeThrough');
        break;
      default:
        break;
    }
  };

  return (
    <div className="admin-root">
      {/* Layered animated background - matching home page */}
      <div className="bg-base" />
      <div className="bg-noise" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-orb bg-orb-4" />
      <div className="bg-lines" />

      <div className="admin-container">
        {/* Animated Header with Glass Effect */}
        <div className="hero-section">
          <div className="hero-glass">
            <div className="hero-top-line" />
            
            <div className="hero-badge-row">
              <span className="hero-badge">✦ ADMIN PORTAL ✦ EXECUTIVE ACCESS</span>
            </div>

            <h1 className="hero-title">
              <span className="hero-title-top">Command Center</span>
              <span className="hero-title-bottom">Content Management Suite</span>
            </h1>

            <p className="hero-subtitle">
              Forge the narrative. Shape perspectives. Control the conversation — 
              with enterprise-grade content management.
            </p>

            <div className="hero-divider">
              <span className="hero-divider-dot" />
              <span className="hero-divider-line" />
              <span className="hero-divider-diamond">◇</span>
              <span className="hero-divider-line" />
              <span className="hero-divider-dot" />
            </div>

            {/* Stats Row with hover effects */}
            <div className="stats-row">
              {[
                { value: posts.length, label: 'Total Posts', icon: '◈' },
                { value: posts.filter(p => p.published).length, label: 'Published', icon: '◉' },
                { value: posts.filter(p => !p.published).length, label: 'Drafts', icon: '✦' },
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
        </div>

        {/* Tab Navigation - Glass Card Style */}
        <div className="main-glass-card">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <span className="tab-icon">✦</span>
              <span className="tab-text">Create</span>
              {activeTab === 'create' && <span className="tab-glow" />}
            </button>
            <button 
              className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <span className="tab-icon">◈</span>
              <span className="tab-text">Manage</span>
              <span className="tab-badge">{posts.length}</span>
              {activeTab === 'manage' && <span className="tab-glow" />}
            </button>
            <button 
              className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
              disabled={!previewPost}
            >
              <span className="tab-icon">◉</span>
              <span className="tab-text">Preview</span>
              {activeTab === 'preview' && <span className="tab-glow" />}
            </button>
          </div>

          {/* Tab Content with Glass Effect */}
          <div className="tab-content-wrapper">
            {/* Create Post Tab */}
            {activeTab === 'create' && (
              <div className="tab-content create-tab">
                <div className="section-header">
                  <div className="section-header-glow" />
                  <h2 className="section-title">
                    <span className="title-accent">✦</span>
                    Craft New Narrative
                  </h2>
                  <p className="section-description">Compose your next masterpiece with precision tools</p>
                </div>

                <form onSubmit={submit} className="form-container">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">◈</span>
                        Title
                      </label>
                      <div className="input-wrapper">
                        <input 
                          className="form-input"
                          placeholder="Enter an engaging title..." 
                          value={title} 
                          onChange={(e) => setTitle(e.target.value)} 
                        />
                        <div className="input-focus-ring" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">◉</span>
                        Slug
                      </label>
                      <div className="input-wrapper">
                        <input 
                          className="form-input"
                          placeholder="unique-post-identifier" 
                          value={slug} 
                          onChange={(e) => setSlug(e.target.value)} 
                        />
                        <div className="input-focus-ring" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="editor-header">
                      <label className="form-label">
                        <span className="label-icon">✦</span>
                        Content
                      </label>
                      <button
                        type="button"
                        className={`preview-toggle ${isPreviewMode ? 'active' : ''}`}
                        onClick={togglePreview}
                      >
                        <span className="toggle-icon">{isPreviewMode ? '✎' : '◉'}</span>
                        {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                      </button>
                    </div>

                    {!isPreviewMode && (
                      <div className="toolbar">
                        <div className="toolbar-group">
                          <button type="button" className="toolbar-btn" onClick={() => formatText('bold')} title="Bold">
                            <strong>B</strong>
                          </button>
                          <button type="button" className="toolbar-btn" onClick={() => formatText('italic')} title="Italic">
                            <em>I</em>
                          </button>
                          <button type="button" className="toolbar-btn" onClick={() => formatText('underline')} title="Underline">
                            <u>U</u>
                          </button>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <select
                            className="toolbar-select"
                            onChange={(e) => {
                              const value = e.target.value;
                              formatText('formatBlock', value === 'p' ? '<p>' : `<${value}>`);
                            }}
                            title="Heading"
                          >
                            <option value="p">Paragraph</option>
                            <option value="h1">H1</option>
                            <option value="h2">H2</option>
                            <option value="h3">H3</option>
                          </select>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <button type="button" className="toolbar-btn" onClick={() => formatText('insertUnorderedList')} title="Bullet List">
                            • List
                          </button>
                          <button type="button" className="toolbar-btn" onClick={() => formatText('insertOrderedList')} title="Numbered List">
                            1. List
                          </button>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <button type="button" className="toolbar-btn" onClick={() => formatText('justifyLeft')} title="Align Left">
                            ←
                          </button>
                          <button type="button" className="toolbar-btn" onClick={() => formatText('justifyCenter')} title="Align Center">
                            ↔
                          </button>
                          <button type="button" className="toolbar-btn" onClick={() => formatText('justifyRight')} title="Align Right">
                            →
                          </button>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => {
                              const url = prompt('Enter URL:');
                              if (url) formatText('createLink', url);
                            }}
                            title="Insert Link"
                          >
                            🔗
                          </button>
                          <button
                            type="button"
                            className="toolbar-btn"
                            onClick={() => {
                              const selection = window.getSelection();
                              if (selection.toString()) {
                                insertHTML('<code>' + selection.toString() + '</code>');
                              } else {
                                insertHTML('<code>code</code>');
                              }
                            }}
                            title="Insert Code"
                          >
                            {'</>'}
                          </button>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <input
                            type="color"
                            value={fontColor}
                            onChange={handleFontColorChange}
                            className="color-picker"
                            title="Font Color"
                          />
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <select
                            className="toolbar-select"
                            value={fontFamily}
                            onChange={handleFontFamilyChange}
                            title="Font Family"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times</option>
                            <option value="Courier New">Courier</option>
                          </select>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <select
                            className="toolbar-select"
                            value={lineSpacing}
                            onChange={handleLineSpacingChange}
                            title="Line Spacing"
                          >
                            <option value="normal">Normal</option>
                            <option value="single">1.0</option>
                            <option value="1.5">1.5</option>
                            <option value="double">2.0</option>
                          </select>
                        </div>

                        <div className="toolbar-divider" />

                        <div className="toolbar-group">
                          <button type="button" className="toolbar-btn danger" onClick={() => formatText('removeFormat')} title="Clear Formatting">
                            ✕ Clear
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="editor-wrapper">
                      {!isPreviewMode ? (
                        <div
                          ref={contentRef}
                          contentEditable
                          className="content-editor"
                          onInput={handleContentInput}
                          data-placeholder="Start crafting your masterpiece..."
                          suppressContentEditableWarning={true}
                        />
                      ) : (
                        <div
                          className="content-preview"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      )}
                      <div className="editor-corner-tl" />
                      <div className="editor-corner-br" />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">◈</span>
                        Tags
                      </label>
                      <div className="input-wrapper">
                        <input 
                          className="form-input"
                          placeholder="technology, business, design" 
                          value={tags} 
                          onChange={(e) => setTags(e.target.value)} 
                        />
                        <div className="input-focus-ring" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-icon">◉</span>
                        Cover Image
                      </label>
                      <div className="file-input-wrapper">
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleFiles}
                          className="file-input"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="file-label">
                          <span className="file-icon">✦</span>
                          <span className="file-text">Choose Images</span>
                        </label>
                        {files.length > 0 && (
                          <span className="file-count">{files.length} selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="publish-toggle">
                    <input 
                      type="checkbox" 
                      checked={published} 
                      onChange={(e) => setPublished(e.target.checked)} 
                      id="pub"
                      className="toggle-input"
                    />
                    <label htmlFor="pub" className="toggle-label">
                      <span className="toggle-switch">
                        <span className="toggle-switch-handle" />
                      </span>
                      <span className="toggle-text">
                        {published ? '✨ Publish immediately' : '📝 Save as draft'}
                      </span>
                    </label>
                  </div>
                  
                  <button className="submit-button" type="submit">
                    <span className="button-glow" />
                    <span className="button-icon">✦</span>
                    <span className="button-text">Publish Story</span>
                    <span className="button-arrow">→</span>
                  </button>
                </form>
              </div>
            )}

            {/* Manage Posts Tab */}
            {activeTab === 'manage' && (
              <div className="tab-content manage-tab">
                <div className="section-header">
                  <div className="section-header-glow" />
                  <h2 className="section-title">
                    <span className="title-accent">◈</span>
                    Content Library
                  </h2>
                  <div className="post-stats">
                    <span className="stat-chip published">{posts.filter(p => p.published).length} Published</span>
                    <span className="stat-chip draft">{posts.filter(p => !p.published).length} Drafts</span>
                  </div>
                </div>

                {isLoading ? (
                  <div className="loading-state">
                    <div className="loading-ring">
                      <div /><div /><div /><div />
                    </div>
                    <p className="loading-text">Curating your content...</p>
                  </div>
                ) : (
                  <div className="posts-grid">
                    {posts.map((post, index) => {
                      const isHovered = hoveredCard === post._id;
                      return (
                        <article
                          key={post._id}
                          className={`post-card ${isHovered ? 'post-card-hovered' : ''}`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onMouseEnter={() => setHoveredCard(post._id)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <div className="card-top-accent" />
                          
                          <div className="card-image-wrap">
                            <div className={`card-image-overlay ${isHovered ? 'overlay-hovered' : ''}`} />
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className={`card-img ${isHovered ? 'card-img-hovered' : ''}`}
                              />
                            ) : (
                              <div className={`card-placeholder ${isHovered ? 'placeholder-hovered' : ''}`}>
                                <span className="placeholder-icon">✦</span>
                              </div>
                            )}
                            
                            <div className={`card-badge ${post.published ? 'badge-live' : 'badge-draft'}`}>
                              <span className="badge-dot" />
                              {post.published ? 'Published' : 'Draft'}
                            </div>
                            
                            <div className="card-number">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                          </div>

                          <div className="card-body">
                            <h3 className="card-title">{post.title}</h3>
                            
                            <div className="card-meta">
                              <span className="meta-item">📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                              <span className="meta-item">❤️ {post.likes || 0}</span>
                            </div>
                            
                            <p className={`card-excerpt ${isHovered ? 'excerpt-hovered' : ''}`}>
                              {post.excerpt}
                            </p>
                            
                            {post.tags && (
                              <div className="card-tags">
                                {(Array.isArray(post.tags) ? post.tags : post.tags.split(','))
                                  .slice(0, 2)
                                  .map((tag, ti) => (
                                    <span key={ti} className="tag-pill">
                                      {tag.trim()}
                                    </span>
                                  ))}
                              </div>
                            )}

                            <div className="card-actions">
                              <button className="action-btn preview" onClick={() => handlePreview(post)}>
                                <span className="action-icon">◉</span>
                                <span>Preview</span>
                              </button>
                              <button className="action-btn toggle" onClick={() => handleTogglePublish(post)}>
                                <span className="action-icon">{post.published ? '📝' : '✨'}</span>
                                <span>{post.published ? 'Unpublish' : 'Publish'}</span>
                              </button>
                              <button className="action-btn delete" onClick={() => handleDelete(post._id)}>
                                <span className="action-icon">✕</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="card-corner-tl" />
                          <div className="card-corner-br" />
                        </article>
                      );
                    })}
                    
                    {posts.length === 0 && (
                      <div className="empty-state">
                        <div className="empty-icon-wrap">
                          <span className="empty-icon">✦</span>
                          <div className="empty-icon-ring" />
                        </div>
                        <h3 className="empty-title">No Stories Yet</h3>
                        <p className="empty-text">
                          Begin your content journey by creating your first masterpiece.
                        </p>
                        <button className="create-first-btn" onClick={() => setActiveTab('create')}>
                          <span className="btn-glow" />
                          <span className="btn-icon">✦</span>
                          <span>Create First Story</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && previewPost && (
              <div className="tab-content preview-tab">
                <div className="preview-header">
                  <button className="back-button" onClick={() => setActiveTab('manage')}>
                    <span className="back-icon">←</span>
                    <span>Back to Library</span>
                  </button>
                  <div className={`preview-status-badge ${previewPost.published ? 'published' : 'draft'}`}>
                    <span className="status-dot" />
                    {previewPost.published ? 'Published' : 'Draft'}
                  </div>
                </div>

                <div className="preview-container">
                  {previewPost.coverImage && (
                    <div className="preview-cover">
                      <img src={previewPost.coverImage} alt={previewPost.title} />
                      <div className="preview-cover-overlay" />
                    </div>
                  )}
                  
                  <h1 className="preview-title">{previewPost.title}</h1>
                  
                  <div className="preview-meta">
                    <span className="preview-meta-item">
                      <span className="meta-icon">📅</span>
                      {new Date(previewPost.createdAt).toLocaleString()}
                    </span>
                    <span className="preview-meta-item">
                      <span className="meta-icon">❤️</span>
                      {previewPost.likes || 0} likes
                    </span>
                  </div>

                  <div className="preview-divider">
                    <span className="divider-dot" />
                    <span className="divider-line" />
                    <span className="divider-diamond">◇</span>
                    <span className="divider-line" />
                    <span className="divider-dot" />
                  </div>

                  <div className="preview-content" dangerouslySetInnerHTML={{ __html: previewPost.content }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Strip */}
        <div className="footer-strip">
          <span className="footer-text">Brandscapers Africa · Executive Command Center</span>
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
        .admin-root {
          min-height: 100vh;
          font-family: var(--font-body);
          position: relative;
          overflow-x: hidden;
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

        /* ── ADMIN CONTAINER ── */
        .admin-container {
          position: relative;
          z-index: 1;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem 2rem 0;
        }

        /* ── HERO SECTION ── */
        .hero-section {
          position: relative;
          margin-bottom: 2rem;
        }

        .hero-glass {
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(60px) saturate(200%);
          -webkit-backdrop-filter: blur(60px) saturate(200%);
          border-radius: 48px;
          border: 1px solid var(--glass-border);
          padding: 3rem;
          box-shadow: 0 40px 100px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25), 0 0 80px rgba(41,121,255,0.12);
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

        .hero-badge-row { margin-bottom: 1.5rem; }

        .hero-badge {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.7rem;
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
          display: flex; flex-direction: column;
          margin-bottom: 1rem;
        }

        .hero-title-top {
          font-family: var(--font-display);
          font-size: 4rem;
          font-weight: 700;
          font-style: italic;
          color: var(--white);
          line-height: 1;
          letter-spacing: -0.03em;
          text-shadow: 0 0 60px rgba(255,255,255,0.2);
        }

        .hero-title-bottom {
          font-family: var(--font-body);
          font-size: 1.2rem;
          font-weight: 300;
          letter-spacing: 8px;
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
          font-size: 1.1rem;
          font-weight: 400;
          line-height: 1.8;
          max-width: 720px;
          margin: 0 0 2rem;
        }

        .hero-divider {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
        }
        .hero-divider-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.4); }
        .hero-divider-line { flex: 1; max-width: 80px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); }
        .hero-divider-diamond { color: rgba(144,201,255,0.6); font-size: 0.8rem; }

        /* Stats */
        .stats-row {
          display: flex; gap: 1.5rem;
          flex-wrap: wrap;
        }

        .stat-card {
          flex: 1; min-width: 140px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 1.5rem;
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
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--white);
          line-height: 1;
          margin-bottom: 0.4rem;
          text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--blue-pale);
          opacity: 0.8;
        }

        /* Main Glass Card */
        .main-glass-card {
          background: rgba(10,25,41,0.3);
          backdrop-filter: blur(60px) saturate(200%);
          -webkit-backdrop-filter: blur(60px) saturate(200%);
          border-radius: 48px;
          border: 1px solid var(--glass-border);
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.3);
          margin-bottom: 2rem;
        }

        /* Tab Navigation */
        .tab-navigation {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 1.5rem 1.5rem 0;
          gap: 0.5rem;
        }

        .tab-button {
          position: relative;
          padding: 1rem 2rem;
          border: none;
          background: transparent;
          color: var(--text-muted-dark);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 1px;
          border-radius: 30px 30px 0 0;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .tab-button:hover:not(:disabled) {
          color: var(--white);
          background: rgba(255,255,255,0.05);
          transform: translateY(-2px);
        }

        .tab-button.active {
          color: var(--white);
          background: linear-gradient(135deg, rgba(41,121,255,0.2), rgba(92,159,255,0.1));
          border-bottom: 2px solid var(--blue-vivid);
        }

        .tab-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .tab-icon {
          font-size: 1.2rem;
          color: var(--blue-light);
        }

        .tab-badge {
          background: rgba(255,255,255,0.15);
          padding: 0.2rem 0.7rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--blue-pale);
        }

        .tab-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at center, rgba(41,121,255,0.2), transparent 70%);
          opacity: 0.5;
          animation: tab-glow 3s ease-in-out infinite;
        }

        @keyframes tab-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        .tab-content-wrapper {
          padding: 2.5rem;
        }

        /* Section Header */
        .section-header {
          position: relative;
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .section-header-glow {
          position: absolute; top: -2rem; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue-vivid), transparent);
          animation: header-glow 4s ease-in-out infinite;
        }

        @keyframes header-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 700;
          font-style: italic;
          color: var(--white);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .title-accent {
          color: var(--blue-light);
          font-size: 2rem;
        }

        .section-description {
          color: var(--text-muted-dark);
          font-size: 1rem;
          font-weight: 400;
        }

        .post-stats {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .stat-chip {
          padding: 0.5rem 1.2rem;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 1px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: var(--text-muted-dark);
        }

        .stat-chip.published {
          color: var(--blue-pale);
          border-color: rgba(92,159,255,0.3);
        }

        .stat-chip.draft {
          color: #fbbf24;
          border-color: rgba(251,191,36,0.3);
        }

        /* Form Styles */
        .form-container {
          width: 100%;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
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
          padding: 1rem 1.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
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
          box-shadow: 0 0 30px rgba(41,121,255,0.2);
        }

        .form-input::placeholder {
          color: rgba(255,255,255,0.3);
          font-style: italic;
        }

        .input-focus-ring {
          position: absolute; inset: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, var(--blue-vivid), transparent);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 0;
        }

        .form-input:focus + .input-focus-ring {
          opacity: 0.3;
        }

        /* Editor Header */
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .preview-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          color: var(--text-muted-dark);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
        }

        .preview-toggle:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--blue-light);
          color: var(--white);
          transform: translateY(-2px);
        }

        .preview-toggle.active {
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
          border-color: transparent;
          color: var(--white);
        }

        .toggle-icon {
          font-size: 1rem;
        }

        /* Toolbar */
        .toolbar {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--glass-border);
          border-bottom: none;
          border-radius: 20px 20px 0 0;
          padding: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          backdrop-filter: blur(20px);
        }

        .toolbar-group {
          display: flex;
          gap: 0.25rem;
          flex-wrap: wrap;
        }

        .toolbar-divider {
          width: 1px;
          height: 30px;
          background: rgba(255,255,255,0.1);
          margin: 0 0.5rem;
        }

        .toolbar-btn {
          padding: 0.6rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: var(--text-muted-dark);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s var(--ease-out);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          min-width: 40px;
          justify-content: center;
        }

        .toolbar-btn:hover {
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
          border-color: transparent;
          color: var(--white);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(41,121,255,0.3);
        }

        .toolbar-btn.danger:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .toolbar-select {
          padding: 0.6rem 1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: var(--text-muted-dark);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s var(--ease-out);
          outline: none;
        }

        .toolbar-select:hover {
          border-color: var(--blue-light);
          color: var(--white);
        }

        .toolbar-select option {
          background: var(--navy-dark);
          color: var(--white);
        }

        .color-picker {
          width: 40px;
          height: 40px;
          padding: 0;
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s var(--ease-out);
        }

        .color-picker:hover {
          border-color: var(--blue-vivid);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(41,121,255,0.3);
        }

        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .color-picker::-webkit-color-swatch {
          border: none;
          border-radius: 10px;
        }

        /* Editor Wrapper */
        .editor-wrapper {
          position: relative;
        }

        .content-editor {
          min-height: 400px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 0 0 20px 20px;
          padding: 2rem;
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.8;
          color: var(--white);
          outline: none;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }

        .content-editor:focus {
          border-color: var(--blue-vivid);
          box-shadow: 0 0 30px rgba(41,121,255,0.1);
        }

        .content-editor[data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255,255,255,0.3);
          font-style: italic;
        }

        .content-preview {
          min-height: 400px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 2rem;
          font-size: 1rem;
          line-height: 1.8;
          color: var(--white);
          overflow-y: auto;
        }

        .editor-corner-tl, .editor-corner-br {
          position: absolute; width: 20px; height: 20px;
          border-color: rgba(41,121,255,0.3);
          border-style: solid;
          pointer-events: none;
          z-index: 2;
        }
        .editor-corner-tl { top: 10px; left: 10px; border-width: 1px 0 0 1px; }
        .editor-corner-br { bottom: 10px; right: 10px; border-width: 0 1px 1px 0; }

        /* File Input */
        .file-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .file-input {
          position: absolute;
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          z-index: -1;
        }

        .file-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          color: var(--text-muted-dark);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
        }

        .file-label:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--blue-light);
          color: var(--white);
          transform: translateY(-2px);
        }

        .file-icon {
          color: var(--blue-light);
          font-size: 1.2rem;
        }

        .file-count {
          color: var(--blue-pale);
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* Publish Toggle */
        .publish-toggle {
          margin: 2rem 0;
        }

        .toggle-input {
          display: none;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          user-select: none;
        }

        .toggle-switch {
          width: 64px;
          height: 32px;
          background: rgba(255,255,255,0.1);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          position: relative;
          transition: all 0.3s var(--ease-out);
        }

        .toggle-switch-handle {
          position: absolute;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, var(--blue-light), var(--blue-vivid));
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s var(--ease-spring);
          box-shadow: 0 2px 10px rgba(41,121,255,0.5);
        }

        .toggle-input:checked + .toggle-label .toggle-switch {
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
        }

        .toggle-input:checked + .toggle-label .toggle-switch-handle {
          left: 35px;
          background: var(--white);
        }

        .toggle-text {
          color: var(--text-on-dark);
          font-weight: 700;
          font-size: 1rem;
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

        .submit-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 30px 50px rgba(41,121,255,0.4);
          background-position: 100% 0;
        }

        .submit-button:active {
          transform: translateY(-1px);
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
        }

        .button-arrow {
          transition: transform 0.3s var(--ease-spring);
        }

        .submit-button:hover .button-arrow {
          transform: translateX(5px);
        }

        /* Posts Grid */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .post-card {
          position: relative;
          background: linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(50px) saturate(180%);
          -webkit-backdrop-filter: blur(50px) saturate(180%);
          border-radius: 32px;
          border: 1px solid var(--glass-border);
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.5s var(--ease-out);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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
          box-shadow: 0 50px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(41,121,255,0.3), 0 0 60px rgba(41,121,255,0.15);
        }

        .card-top-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 0;
          background: linear-gradient(90deg, var(--navy-bright), var(--blue-vivid), var(--blue-light));
          transition: height 0.4s var(--ease-out);
          z-index: 2;
        }

        .post-card-hovered .card-top-accent { height: 2px; }

        .card-image-wrap {
          position: relative; height: 200px; overflow: hidden;
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
          font-size: 3rem;
          color: rgba(255,255,255,0.15);
          transition: all 0.5s var(--ease-spring);
        }
        .placeholder-hovered .placeholder-icon {
          color: rgba(255,255,255,0.3);
          transform: scale(1.4) rotate(15deg);
        }

        .card-badge {
          position: absolute; top: 1rem; left: 1rem; z-index: 3;
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.35rem 0.9rem;
          border-radius: 30px;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px;
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
          position: absolute; bottom: 1rem; right: 1rem; z-index: 3;
          font-family: var(--font-display);
          font-size: 2rem; font-weight: 700; font-style: italic;
          color: rgba(255,255,255,0.12);
          line-height: 1;
          transition: color 0.4s ease;
        }
        .post-card-hovered .card-number { color: rgba(255,255,255,0.22); }

        .card-body {
          padding: 1.5rem;
          flex: 1; display: flex; flex-direction: column; gap: 1rem;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--white);
          line-height: 1.3;
          letter-spacing: -0.02em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          color: var(--text-muted-dark);
          font-size: 0.8rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .card-excerpt {
          font-size: 0.9rem;
          color: var(--text-muted-dark);
          line-height: 1.7;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: -webkit-line-clamp 0.3s;
        }
        .excerpt-hovered { -webkit-line-clamp: 5; }

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

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          min-width: fit-content;
          padding: 0.6rem 1rem;
          border: none;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-muted-dark);
          backdrop-filter: blur(10px);
        }

        .action-btn:hover {
          transform: translateY(-3px);
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
          border-color: transparent;
          color: var(--white);
          box-shadow: 0 10px 20px rgba(41,121,255,0.3);
        }

        .action-btn.preview:hover {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .action-btn.delete:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .action-icon {
          font-size: 0.9rem;
        }

        .card-corner-tl, .card-corner-br {
          position: absolute; width: 20px; height: 20px;
          border-color: rgba(41,121,255,0.3);
          border-style: solid;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .card-corner-tl { top: 10px; left: 10px; border-width: 1px 0 0 1px; }
        .card-corner-br { bottom: 10px; right: 10px; border-width: 0 1px 1px 0; }
        .post-card-hovered .card-corner-tl,
        .post-card-hovered .card-corner-br { opacity: 1; }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 2rem;
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

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 5rem 2rem;
          background: rgba(255,255,255,0.03);
          border-radius: 40px;
          border: 1px dashed var(--glass-border);
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
          font-size: 2rem;
          font-weight: 700; font-style: italic;
          color: var(--white); margin-bottom: 1rem;
        }
        .empty-text {
          font-size: 1rem;
          color: var(--text-muted-dark); line-height: 1.7;
          margin-bottom: 2rem;
        }

        .create-first-btn {
          position: relative;
          padding: 1rem 2.5rem;
          border: none;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--navy-bright), var(--blue-vivid));
          color: var(--white);
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .create-first-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(41,121,255,0.3);
        }

        .btn-glow {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s ease;
        }

        .create-first-btn:hover .btn-glow {
          transform: translateX(100%);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        /* Preview Tab */
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--glass-border);
          border-radius: 30px;
          color: var(--text-muted-dark);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
        }

        .back-button:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--blue-light);
          color: var(--white);
          transform: translateX(-5px);
        }

        .back-icon {
          font-size: 1.2rem;
        }

        .preview-status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.5rem;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .preview-status-badge.published {
          background: rgba(72,187,120,0.2);
          border: 1px solid rgba(72,187,120,0.3);
          color: #a7f3d0;
        }

        .preview-status-badge.draft {
          background: rgba(237,137,54,0.2);
          border: 1px solid rgba(237,137,54,0.3);
          color: #fde68a;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .preview-container {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--glass-border);
          border-radius: 40px;
          padding: 3rem;
          backdrop-filter: blur(20px);
        }

        .preview-cover {
          position: relative;
          width: 100%;
          margin-bottom: 2rem;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .preview-cover img {
          width: 100%;
          height: auto;
          display: block;
        }

        .preview-cover-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(41,121,255,0.1), transparent);
          pointer-events: none;
        }

        .preview-title {
          font-family: var(--font-display);
          font-size: 3rem;
          font-weight: 700;
          font-style: italic;
          color: var(--white);
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .preview-meta {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          color: var(--text-muted-dark);
          font-size: 0.95rem;
        }

        .preview-meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-icon {
          font-size: 1rem;
          color: var(--blue-light);
        }

        .preview-divider {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
        }
        .divider-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.4); }
        .divider-line { flex: 1; max-width: 80px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); }
        .divider-diamond { color: rgba(144,201,255,0.6); font-size: 0.8rem; }

        .preview-content {
          font-size: 1.1rem;
          line-height: 1.9;
          color: var(--text-on-dark);
        }

        .preview-content h1 { font-size: 2.2rem; font-weight: 700; margin: 2rem 0 1rem; color: var(--white); }
        .preview-content h2 { font-size: 1.8rem; font-weight: 600; margin: 1.75rem 0 0.75rem; color: var(--white); }
        .preview-content h3 { font-size: 1.4rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--white); }
        .preview-content p { margin-bottom: 1.5rem; }
        .preview-content img { border-radius: 20px; max-width: 100%; margin: 2rem 0; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .preview-content blockquote { border-left: 4px solid var(--blue-vivid); padding-left: 1.5rem; margin: 2rem 0; color: var(--blue-pale); font-style: italic; }
        .preview-content code { background: rgba(0,0,0,0.3); padding: 0.3rem 0.6rem; border-radius: 8px; font-family: 'Courier New', monospace; }

        /* Footer Strip */
        .footer-strip {
          text-align: center;
          padding: 2rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin-top: 2rem;
        }

        .footer-text {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 4px;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-title-top { font-size: 3.5rem; }
          .hero-title-bottom { font-size: 1rem; letter-spacing: 6px; }
          .tab-content-wrapper { padding: 2rem; }
          .form-row { gap: 1.5rem; }
          .posts-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        }

        @media (max-width: 768px) {
          .admin-container { padding: 1rem 1rem 0; }
          
          .hero-glass { padding: 2rem; }
          .hero-title-top { font-size: 2.8rem; }
          .hero-title-bottom { font-size: 0.9rem; letter-spacing: 4px; }
          .hero-subtitle { font-size: 1rem; }
          
          .stats-row { gap: 1rem; }
          .stat-card { min-width: 120px; padding: 1.2rem; }
          .stat-number { font-size: 2rem; }
          
          .tab-navigation { flex-direction: column; padding: 1rem 1rem 0; }
          .tab-button { border-radius: 30px; }
          
          .tab-content-wrapper { padding: 1.5rem; }
          
          .section-title { font-size: 1.8rem; }
          
          .form-row { grid-template-columns: 1fr; }
          
          .toolbar { flex-direction: column; align-items: stretch; }
          .toolbar-group { justify-content: center; }
          .toolbar-divider { display: none; }
          
          .posts-grid { grid-template-columns: 1fr; }
          
          .preview-container { padding: 2rem; }
          .preview-title { font-size: 2.2rem; }
          .preview-meta { flex-direction: column; gap: 0.75rem; }
        }

        @media (max-width: 480px) {
          .hero-glass { padding: 1.5rem; }
          .hero-title-top { font-size: 2.2rem; }
          .hero-title-bottom { font-size: 0.8rem; letter-spacing: 3px; }
          
          .stats-row { flex-direction: column; }
          .stat-card { width: 100%; max-width: none; }
          
          .tab-content-wrapper { padding: 1rem; }
          
          .section-title { font-size: 1.5rem; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          
          .editor-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
          
          .toolbar-group { flex-wrap: wrap; }
          .toolbar-btn { flex: 1; }
          
          .content-editor, .content-preview { min-height: 300px; padding: 1rem; }
          
          .card-actions { flex-direction: column; }
          .action-btn { width: 100%; }
          
          .preview-container { padding: 1.5rem; }
          .preview-title { font-size: 1.8rem; }
          .preview-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
          
          .footer-text { letter-spacing: 2px; }
        }

        /* Editor Content Styles */
        .content-editor h1, .content-preview h1 { font-size: 2.2rem; font-weight: 700; margin: 1.5rem 0 1rem; color: var(--white); }
        .content-editor h2, .content-preview h2 { font-size: 1.8rem; font-weight: 600; margin: 1.25rem 0 0.75rem; color: var(--white); }
        .content-editor h3, .content-preview h3 { font-size: 1.4rem; font-weight: 600; margin: 1rem 0 0.5rem; color: var(--white); }
        .content-editor p, .content-preview p { line-height: 1.8; margin-bottom: 1rem; color: var(--text-on-dark); }
        .content-editor ul, .content-editor ol, .content-preview ul, .content-preview ol { margin: 1rem 0; padding-left: 2rem; color: var(--text-on-dark); }
        .content-editor li, .content-preview li { margin-bottom: 0.5rem; }
        .content-editor blockquote, .content-preview blockquote { border-left: 4px solid var(--blue-vivid); padding-left: 1rem; margin: 1rem 0; color: var(--blue-pale); font-style: italic; }
        .content-editor code, .content-preview code { background: rgba(0,0,0,0.3); padding: 0.2rem 0.4rem; border-radius: 6px; font-family: 'Courier New', monospace; color: #fbbf24; }
        .content-editor a, .content-preview a { color: var(--blue-light); text-decoration: underline; }
        .content-editor img, .content-preview img { border-radius: 12px; max-width: 100%; margin: 1rem 0; box-shadow: 0 8px 25px rgba(0,0,0,0.2); }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}