/**
 * Google Reviews Embed Script - Premium Edition
 * Version 2.0.0
 * 
 * Smart sentiment-based routing with premium UI
 */

(function() {
  'use strict';

  let config = null;
  let embedData = null;
  let sessionId = generateSessionId();
  let selectedRating = 0;

  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getScriptData() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && (scripts[i].src.includes('embed.js') || scripts[i].src.includes('embed-v2.js'))) {
        return {
          tenantId: scripts[i].getAttribute('data-tenant-id'),
          siteId: scripts[i].getAttribute('data-site-id'),
          locationId: scripts[i].getAttribute('data-location-id'),
          apiUrl: scripts[i].getAttribute('data-api-url') || 'http://localhost:3000'
        };
      }
    }
    return null;
  }

  async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${embedData.apiUrl}${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }

  async function logEvent(eventType, eventData = {}) {
    await apiCall('/api/log', 'POST', {
      tenantId: embedData.tenantId,
      siteId: embedData.siteId,
      locationId: embedData.locationId,
      eventType,
      eventData,
      sessionId
    });
  }

  function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#',''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
      (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
      .toString(16).slice(1);
  }

  function injectStyles() {
    const primaryColor = config.branding?.primaryColor || '#4285F4';
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      * { box-sizing: border-box; }
      
      .gr-embed-button {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, ${primaryColor}dd 0%, ${adjustColor(primaryColor, -15)}dd 100%);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        color: white;
        border: 1px solid rgba(255,255,255,0.18);
        padding: 16px 32px;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.01em;
        border-radius: 16px;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      .gr-embed-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.6s;
      }
      .gr-embed-button:hover::before {
        left: 100%;
      }
      .gr-embed-button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2);
        border-color: rgba(255,255,255,0.3);
      }
      .gr-embed-button:active {
        transform: translateY(0) scale(0.98);
      }
      
      .gr-embed-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      }
      .gr-embed-modal.active {
        display: flex;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .gr-embed-modal-content {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(40px) saturate(180%);
        -webkit-backdrop-filter: blur(40px) saturate(180%);
        padding: 48px 40px;
        border-radius: 24px;
        max-width: 480px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
        position: relative;
        border: 1px solid rgba(255,255,255,0.3);
        animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .gr-embed-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.05);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .gr-embed-close:hover {
        background: rgba(0,0,0,0.1);
        color: #333;
        transform: rotate(90deg);
      }
      
      .gr-embed-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 12px 0;
        color: #1a1a1a;
        letter-spacing: -0.02em;
        line-height: 1.2;
      }
      
      .gr-embed-subtitle {
        font-size: 15px;
        color: #666;
        margin: 0 0 32px 0;
        line-height: 1.6;
        font-weight: 400;
      }
      
      .gr-embed-view {
        display: none;
      }
      .gr-embed-view.active {
        display: block;
        animation: slideUp 0.3s ease-out;
      }
      
      .gr-rating-stars {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin: 32px 0;
        padding: 24px;
        background: rgba(255,255,255,0.5);
        border-radius: 20px;
        border: 1px solid rgba(0,0,0,0.05);
      }
      
      .gr-star {
        font-size: 48px;
        cursor: pointer;
        color: #e0e0e0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      }
      .gr-star:hover {
        transform: scale(1.15);
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
      }
      .gr-star.active {
        color: #FFD700;
        transform: scale(1.1);
      }
      .gr-star.active:hover {
        transform: scale(1.2);
      }
      
      .gr-form-group {
        margin-bottom: 20px;
      }
      
      .gr-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
        letter-spacing: -0.01em;
      }
      
      .gr-textarea,
      .gr-input {
        width: 100%;
        padding: 14px 16px;
        border: 1.5px solid rgba(0,0,0,0.1);
        border-radius: 12px;
        font-size: 15px;
        font-family: inherit;
        background: rgba(255,255,255,0.8);
        transition: all 0.3s ease;
        color: #333;
      }
      .gr-textarea:focus,
      .gr-input:focus {
        outline: none;
        border-color: ${primaryColor};
        background: white;
        box-shadow: 0 0 0 3px ${primaryColor}22;
      }
      .gr-textarea {
        resize: vertical;
        min-height: 120px;
      }
      
      .gr-btn-primary {
        background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
        color: white;
        border: none;
        padding: 16px 32px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px ${primaryColor}44;
        letter-spacing: -0.01em;
      }
      .gr-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px ${primaryColor}55;
      }
      .gr-btn-primary:active {
        transform: translateY(0);
      }
      
      .gr-btn-secondary {
        background: rgba(0,0,0,0.05);
        color: #666;
        border: none;
        padding: 14px 28px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        width: 100%;
        margin-top: 12px;
        transition: all 0.3s ease;
      }
      .gr-btn-secondary:hover {
        background: rgba(0,0,0,0.08);
        color: #333;
      }
      
      .gr-success {
        text-align: center;
        padding: 40px 20px;
      }
      .gr-success-icon {
        font-size: 64px;
        margin-bottom: 20px;
        display: inline-block;
        animation: successPop 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes successPop {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      .gr-success-title {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 12px 0;
      }
      .gr-success-text {
        font-size: 15px;
        color: #666;
        line-height: 1.6;
      }
      
      .gr-divider {
        display: flex;
        align-items: center;
        margin: 24px 0;
        color: #999;
        font-size: 13px;
        font-weight: 500;
      }
      .gr-divider::before,
      .gr-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(0,0,0,0.1);
      }
      .gr-divider::before {
        margin-right: 12px;
      }
      .gr-divider::after {
        margin-left: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  function createButton() {
    const button = document.createElement('button');
    button.className = 'gr-embed-button';
    button.textContent = config.branding?.buttonText || 'Share Your Feedback';
    button.onclick = openModal;
    document.body.appendChild(button);

    button.style.position = 'fixed';
    button.style.bottom = '32px';
    button.style.right = '32px';
    button.style.zIndex = '9999';

    logEvent('widget_loaded');
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'gr-embed-modal';
    modal.id = 'gr-modal';

    modal.innerHTML = `
      <div class="gr-embed-modal-content">
        <button class="gr-embed-close" onclick="window.GREmbed.close()">&times;</button>
        
        <!-- Step 1: Rating -->
        <div id="gr-view-rating" class="gr-embed-view active">
          <h2 class="gr-embed-title">How was your experience?</h2>
          <p class="gr-embed-subtitle">Your honest feedback helps us improve and serve you better.</p>
          
          <div class="gr-rating-stars" id="gr-rating-stars">
            <span class="gr-star" data-rating="1">★</span>
            <span class="gr-star" data-rating="2">★</span>
            <span class="gr-star" data-rating="3">★</span>
            <span class="gr-star" data-rating="4">★</span>
            <span class="gr-star" data-rating="5">★</span>
          </div>
        </div>

        <!-- Step 2: High Rating (4-5 stars) -->
        <div id="gr-view-high-rating" class="gr-embed-view">
          <h2 class="gr-embed-title">Thank you! 🎉</h2>
          <p class="gr-embed-subtitle">We're thrilled you had a great experience! Would you mind sharing your feedback on Google Reviews?</p>
          
          <button class="gr-btn-primary" onclick="window.GREmbed.goToGoogle()">
            ⭐ Leave a Google Review
          </button>
          
          <div class="gr-divider">OR</div>
          
          <button class="gr-btn-secondary" onclick="window.GREmbed.showFeedbackForm()">
            Share private feedback instead
          </button>
        </div>

        <!-- Step 3: Low Rating (1-3 stars) -->
        <div id="gr-view-low-rating" class="gr-embed-view">
          <h2 class="gr-embed-title">We'd love to hear from you</h2>
          <p class="gr-embed-subtitle">We're sorry your experience wasn't perfect. Please share your feedback with us directly so we can make things right.</p>
          
          <form id="gr-feedback-form">
            <div class="gr-form-group">
              <label class="gr-label">Tell us what happened *</label>
              <textarea class="gr-textarea" id="gr-message" required placeholder="Share your experience with us..."></textarea>
            </div>
            
            <div class="gr-form-group">
              <label class="gr-label">Email (optional)</label>
              <input type="email" class="gr-input" id="gr-email" placeholder="your@email.com" />
            </div>
            
            <button type="submit" class="gr-btn-primary">Submit Feedback</button>
          </form>
          
          <div class="gr-divider">OR</div>
          
          <button class="gr-btn-secondary" onclick="window.GREmbed.goToGoogle()">
            Leave a Google Review anyway
          </button>
        </div>

        <!-- Step 4: Success -->
        <div id="gr-view-success" class="gr-embed-view">
          <div class="gr-success">
            <div class="gr-success-icon">✓</div>
            <h2 class="gr-success-title">Thank You!</h2>
            <p class="gr-success-text">We've received your feedback and really appreciate you taking the time to help us improve.</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setupRatingStars();
    setupFeedbackForm();

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  function setupRatingStars() {
    const stars = document.querySelectorAll('.gr-star');
    
    stars.forEach(star => {
      star.onclick = function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));
        updateStars(selectedRating);
        
        setTimeout(() => {
          logEvent('rating_selected', { rating: selectedRating });
          
          if (selectedRating >= 4) {
            showView('gr-view-high-rating');
            logEvent('high_rating_path');
          } else {
            showView('gr-view-low-rating');
            logEvent('low_rating_path');
          }
        }, 400);
      };
      
      star.onmouseenter = function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        updateStars(rating, true);
      };
    });

    const ratingContainer = document.getElementById('gr-rating-stars');
    ratingContainer.onmouseleave = () => {
      updateStars(selectedRating);
    };

    function updateStars(rating, isHover = false) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add('active');
          if (isHover) star.style.opacity = '0.7';
        } else {
          star.classList.remove('active');
          if (isHover) star.style.opacity = '1';
        }
      });
      
      if (!isHover) {
        stars.forEach(star => star.style.opacity = '1');
      }
    }
  }

  function setupFeedbackForm() {
    const form = document.getElementById('gr-feedback-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      const message = document.getElementById('gr-message').value;
      const email = document.getElementById('gr-email').value;

      const result = await apiCall('/api/feedback', 'POST', {
        tenantId: embedData.tenantId,
        siteId: embedData.siteId,
        locationId: embedData.locationId,
        rating: selectedRating,
        message,
        contactEmail: email || null,
        sessionId
      });

      if (result && result.success) {
        logEvent('feedback_submitted', { rating: selectedRating });
        showView('gr-view-success');
        setTimeout(() => closeModal(), 3000);
      }
    };
  }

  function showView(viewId) {
    document.querySelectorAll('.gr-embed-view').forEach(view => {
      view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
  }

  function openModal() {
    document.getElementById('gr-modal').classList.add('active');
    showView('gr-view-rating');
    selectedRating = 0;
    updateStars(0);
    logEvent('button_clicked');
  }

  function closeModal() {
    document.getElementById('gr-modal').classList.remove('active');
    logEvent('widget_closed');
  }

  function goToGoogle() {
    logEvent('review_started', { rating: selectedRating });
    window.open(config.googleReviewUrl, '_blank');
    setTimeout(() => {
      logEvent('review_completed');
      closeModal();
    }, 500);
  }

  function showFeedbackForm() {
    showView('gr-view-low-rating');
    logEvent('feedback_opened');
  }

  function updateStars(rating) {
    const stars = document.querySelectorAll('.gr-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  // Public API
  window.GREmbed = {
    open: openModal,
    close: closeModal,
    goToGoogle: goToGoogle,
    showFeedbackForm: showFeedbackForm
  };

  // Initialize
  async function init() {
    embedData = getScriptData();
    
    if (!embedData || !embedData.tenantId || !embedData.siteId || !embedData.locationId) {
      console.error('Google Reviews Embed: Missing required data attributes');
      return;
    }

    const configUrl = `/api/config?tenantId=${embedData.tenantId}&siteId=${embedData.siteId}&locationId=${embedData.locationId}`;
    const result = await apiCall(configUrl);

    if (!result || !result.success) {
      console.error('Google Reviews Embed: Failed to load configuration');
      return;
    }

    config = result.config;
    console.log('Google Reviews Embed initialized');

    injectStyles();
    createButton();
    createModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
