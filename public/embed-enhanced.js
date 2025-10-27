/**
 * Google Reviews Embed Script - Enhanced Tiered Feedback
 * Version 2.0.0
 * 
 * Embeddable widget with star-rating based conditional flow.
 * 4-5 stars → Google Review redirect
 * 1-3 stars → Private feedback collection
 */

(function() {
  'use strict';

  // Configuration
  let config = null;
  let embedData = null;
  let sessionId = generateSessionId();
  let selectedRating = 0;

  // Generate unique session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get script data attributes
  function getScriptData() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('embed')) {
        return {
          tenantId: scripts[i].getAttribute('data-tenant-id'),
          siteId: scripts[i].getAttribute('data-site-id'),
          locationId: scripts[i].getAttribute('data-location-id'),
          apiUrl: scripts[i].getAttribute('data-api-url') || 'http://localhost:3000',
          whiteLabel: scripts[i].getAttribute('data-white-label') === 'true'
        };
      }
    }
    return null;
  }

  // API call helper
  async function apiCall(endpoint, method = 'GET', body = null) {
    const url = `${embedData.apiUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }

  // Log event to API
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

  // Darken color helper
  function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Inject CSS styles
  function injectStyles() {
    const primaryColor = config.branding?.primaryColor || '#4285F4';
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      .gr-embed-button {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%);
        color: white;
        border: none;
        padding: 16px 32px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 16px;
        cursor: pointer;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
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
        transition: left 0.5s;
      }
      .gr-embed-button:hover::before {
        left: 100%;
      }
      .gr-embed-button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 12px 48px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.12);
      }
      .gr-embed-modal {
        display: none !important;
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
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .gr-embed-modal.active {
        display: flex !important;
        animation: modalFadeIn 0.3s ease forwards;
      }
      @keyframes modalFadeIn {
        to { opacity: 1; }
      }
      .gr-embed-modal-content {
        background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
        padding: 40px;
        border-radius: 24px;
        max-width: 480px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 80px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.1);
        position: relative;
        transform: scale(0.9) translateY(20px);
        animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
      @keyframes modalSlideIn {
        to {
          transform: scale(1) translateY(0);
        }
      }
      @media (max-width: 768px) {
        .gr-embed-modal-content {
          padding: 28px;
          border-radius: 20px;
          width: 92%;
        }
      }
      .gr-embed-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.05);
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .gr-embed-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #333;
        transform: rotate(90deg);
      }
      .gr-embed-title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 12px 0;
        color: #1a1a1a;
        letter-spacing: -0.5px;
      }
      @media (max-width: 768px) {
        .gr-embed-title {
          font-size: 24px;
        }
      }
      .gr-embed-subtitle {
        font-size: 15px;
        color: #6b7280;
        margin: 0 0 32px 0;
        line-height: 1.6;
      }
      .gr-embed-rating-view {
        text-align: center;
      }
      .gr-embed-rating {
        display: flex;
        gap: 16px;
        justify-content: center;
        margin: 40px 0;
      }
      @media (max-width: 768px) {
        .gr-embed-rating {
          gap: 12px;
          margin: 32px 0;
        }
      }
      .gr-embed-star {
        font-size: 52px;
        cursor: pointer;
        color: #e5e7eb;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        user-select: none;
      }
      @media (max-width: 768px) {
        .gr-embed-star {
          font-size: 44px;
        }
      }
      .gr-embed-star:hover {
        color: #FBBF24;
        transform: scale(1.2) rotate(-5deg);
        filter: drop-shadow(0 4px 8px rgba(251, 191, 36, 0.4));
      }
      .gr-embed-star.active {
        color: #F59E0B;
        transform: scale(1.15);
        filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.5));
      }
      .gr-embed-view {
        display: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
      }
      .gr-embed-view.active {
        display: block;
        animation: viewFadeIn 0.4s ease forwards;
      }
      @keyframes viewFadeIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .gr-embed-form-group {
        margin-bottom: 16px;
      }
      .gr-embed-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
      }
      .gr-embed-input,
      .gr-embed-textarea {
        width: 100%;
        padding: 14px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 15px;
        font-family: inherit;
        box-sizing: border-box;
        transition: all 0.3s ease;
        background: #f9fafb;
      }
      .gr-embed-input:focus,
      .gr-embed-textarea:focus {
        outline: none;
        border-color: ${primaryColor};
        background: white;
        box-shadow: 0 0 0 4px rgba(66, 133, 244, 0.1);
      }
      .gr-embed-textarea {
        resize: vertical;
        min-height: 110px;
      }
      .gr-embed-checkbox {
        margin-right: 8px;
      }
      .gr-embed-submit {
        background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -15)} 100%);
        color: white;
        border: none;
        padding: 16px 32px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 12px;
        cursor: pointer;
        width: 100%;
        margin-top: 20px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.08);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }
      .gr-embed-submit::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
      }
      .gr-embed-submit:hover::before {
        left: 100%;
      }
      .gr-embed-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1);
      }
      .gr-embed-submit:active {
        transform: translateY(0);
      }
      .gr-embed-success {
        text-align: center;
        padding: 32px 24px;
      }
      .gr-embed-success-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: inline-block;
      }
      @keyframes successPop {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.2);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .gr-embed-footer {
        text-align: center;
        padding: 16px 0 0;
        margin-top: 24px;
        border-top: 1px solid #e5e7eb;
        font-size: 12px;
        color: #9ca3af;
      }
      .gr-embed-footer a {
        color: #6b7280;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s;
      }
      .gr-embed-footer a:hover {
        color: #374151;
      }
    `;
    document.head.appendChild(style);
  }

  // Create button widget
  function createButton() {
    const button = document.createElement('button');
    button.className = 'gr-embed-button';
    button.textContent = config.branding?.buttonText || 'Leave a Review';
    button.onclick = openModal;
    document.body.appendChild(button);

    // Position button (bottom left by default)
    button.style.position = 'fixed';
    button.style.bottom = '24px';
    button.style.left = '24px';
    button.style.zIndex = '9999';

    logEvent('widget_loaded');
  }

  // Create modal with tiered flow
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'gr-embed-modal';
    modal.id = 'gr-embed-modal';

    modal.innerHTML = `
      <div class="gr-embed-modal-content">
        <button class="gr-embed-close" onclick="window.GoogleReviewsEmbed.closeModal()">&times;</button>
        
        <!-- Rating Selection View -->
        <div id="gr-rating-view" class="gr-embed-view gr-embed-rating-view active">
          <h2 class="gr-embed-title">How was your experience?</h2>
          <p class="gr-embed-subtitle">Please rate your experience with ${config.locationName || 'us'}</p>
          
          <div class="gr-embed-rating" id="gr-rating-stars">
            <span class="gr-embed-star" data-rating="1">★</span>
            <span class="gr-embed-star" data-rating="2">★</span>
            <span class="gr-embed-star" data-rating="3">★</span>
            <span class="gr-embed-star" data-rating="4">★</span>
            <span class="gr-embed-star" data-rating="5">★</span>
          </div>
        </div>

        <!-- 5-Star View -->
        <div id="gr-5star-view" class="gr-embed-view">
          <h2 class="gr-embed-title">🌟 Thank you!</h2>
          <p class="gr-embed-subtitle">We're thrilled you had a great experience! Would you mind sharing your feedback on Google?</p>
          <button class="gr-embed-submit" onclick="window.GoogleReviewsEmbed.redirectToGoogle()">Leave a Google Review</button>
        </div>

        <!-- 4-Star View -->
        <div id="gr-4star-view" class="gr-embed-view">
          <h2 class="gr-embed-title">Thanks for your feedback!</h2>
          <p class="gr-embed-subtitle">We're glad you had a good experience. How can we make it even better?</p>
          <form id="gr-improvement-form">
            <div class="gr-embed-form-group">
              <textarea class="gr-embed-textarea" id="gr-improvement-message" placeholder="What could we improve?"></textarea>
            </div>
            <button type="submit" class="gr-embed-submit">Submit & Leave Google Review</button>
          </form>
        </div>

        <!-- Negative Rating View (1-3 stars) -->
        <div id="gr-negative-view" class="gr-embed-view">
          <h2 class="gr-embed-title">We're sorry to hear that</h2>
          <p class="gr-embed-subtitle">Your feedback is important to us. Please let us know what went wrong so we can improve.</p>
          
          <form id="gr-feedback-form">
            <div class="gr-embed-form-group">
              <label class="gr-embed-label">What happened? *</label>
              <textarea class="gr-embed-textarea" id="gr-feedback-message" required placeholder="Please describe your experience..."></textarea>
            </div>
            
            <div class="gr-embed-form-group">
              <label class="gr-embed-label">Your email (optional)</label>
              <input type="email" class="gr-embed-input" id="gr-feedback-email" placeholder="your@email.com" />
              <small style="color: #666; font-size: 12px;">We'd like to follow up with you</small>
            </div>
            
            <div class="gr-embed-form-group">
              <label class="gr-embed-label">Your phone (optional)</label>
              <input type="tel" class="gr-embed-input" id="gr-feedback-phone" placeholder="+1 (555) 123-4567" />
            </div>

            <div class="gr-embed-form-group">
              <label style="display: flex; align-items: center; font-weight: normal; cursor: pointer;">
                <input type="checkbox" class="gr-embed-checkbox" id="gr-feedback-urgent" />
                <span>This is urgent and needs immediate attention</span>
              </label>
            </div>
            
            <button type="submit" class="gr-embed-submit">Submit Feedback</button>
          </form>
          
          <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 13px; margin-bottom: 12px;">Or share your experience on Google</p>
            <button onclick="window.GoogleReviewsEmbed.redirectToGoogle()" style="background: transparent; border: 1px solid #ddd; color: #666; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px;">Leave a Google Review</button>
          </div>
        </div>

        <!-- Success View -->
        <div id="gr-success-view" class="gr-embed-view">
          <div class="gr-embed-success">
            <div class="gr-embed-success-icon">✓</div>
            <h2 class="gr-embed-title">Thank You!</h2>
            <p class="gr-embed-subtitle">Your feedback has been received and we'll address it promptly.</p>
          </div>
        </div>
        
        ${!embedData.whiteLabel ? '<div class="gr-embed-footer">Powered by <a href="https://hypeinsight.com/?utm_source=review_widget&utm_medium=referral&utm_campaign=powered_by_review_modal" target="_blank" rel="noopener">Hype Insight</a></div>' : ''}
      </div>
    `;

    document.body.appendChild(modal);

    // Setup event handlers
    setupRatingStars();
    setupFeedbackForm();
    setupImprovementForm();

    // Close modal on backdrop click
    modal.onclick = function(e) {
      if (e.target === modal) {
        closeModal();
      }
    };
  }

  // Setup rating stars interaction
  function setupRatingStars() {
    const stars = document.querySelectorAll('.gr-embed-star');
    
    stars.forEach(star => {
      star.onmouseover = function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        updateStars(rating, false);
      };

      star.onmouseout = function() {
        updateStars(selectedRating, true);
      };

      star.onclick = function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));
        updateStars(selectedRating, true);
        handleRatingSelected(selectedRating);
      };
    });
  }

  function handleRatingSelected(rating) {
    logEvent('rating_selected', { rating });

    // Hide rating view
    document.getElementById('gr-rating-view').classList.remove('active');

    // Show appropriate view based on rating
    setTimeout(() => {
      if (rating === 5) {
        // 5 stars - direct to Google
        document.getElementById('gr-5star-view').classList.add('active');
      } else if (rating === 4) {
        // 4 stars - ask for improvements
        document.getElementById('gr-4star-view').classList.add('active');
      } else {
        // 1-3 stars - collect feedback
        document.getElementById('gr-negative-view').classList.add('active');
      }
    }, 300);
  }

  function updateStars(rating, permanent) {
    const stars = document.querySelectorAll('.gr-embed-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }


  // Setup 4-star improvement form
  function setupImprovementForm() {
    const form = document.getElementById('gr-improvement-form');
    if (!form) return;
    
    form.onsubmit = async function(e) {
      e.preventDefault();
      
      const message = document.getElementById('gr-improvement-message').value;
      
      // Only submit if there's a message
      if (message && message.trim()) {
        await apiCall('/api/feedback', 'POST', {
          tenantId: embedData.tenantId,
          siteId: embedData.siteId,
          locationId: embedData.locationId,
          rating: selectedRating,
          message: message.trim(),
          contactEmail: null,
          contactPhone: null,
          sessionId
        });
        
        logEvent('improvement_submitted', { rating: selectedRating });
      }
      
      // Redirect to Google regardless
      window.GoogleReviewsEmbed.redirectToGoogle();
    };
  }

  // Setup feedback form submission
  function setupFeedbackForm() {
    const form = document.getElementById('gr-feedback-form');
    form.onsubmit = async function(e) {
      e.preventDefault();
      
      const message = document.getElementById('gr-feedback-message').value;
      const email = document.getElementById('gr-feedback-email').value;
      const phone = document.getElementById('gr-feedback-phone').value;
      const urgent = document.getElementById('gr-feedback-urgent').checked;

      const result = await apiCall('/api/feedback', 'POST', {
        tenantId: embedData.tenantId,
        siteId: embedData.siteId,
        locationId: embedData.locationId,
        rating: selectedRating,
        message,
        contactEmail: email || null,
        contactPhone: phone || null,
        isUrgent: urgent,
        sessionId
      });

      if (result && result.success) {
        logEvent('feedback_submitted', { rating: selectedRating, urgent });
        showSuccessView();
      }
    };
  }

  function showSuccessView() {
    document.getElementById('gr-negative-view').classList.remove('active');
    document.getElementById('gr-success-view').classList.add('active');
    setTimeout(() => {
      window.GoogleReviewsEmbed.closeModal();
    }, 3000);
  }

  // Public API
  window.GoogleReviewsEmbed = {
    openModal: function() {
      const modal = document.getElementById('gr-embed-modal');
      modal.classList.add('active');
      
      // Reset to rating view
      document.querySelectorAll('.gr-embed-view').forEach(v => v.classList.remove('active'));
      document.getElementById('gr-rating-view').classList.add('active');
      selectedRating = 0;
      updateStars(0, true);
      
      logEvent('button_clicked');
    },

    closeModal: function() {
      const modal = document.getElementById('gr-embed-modal');
      modal.classList.remove('active');
      logEvent('widget_closed');
    },

    redirectToGoogle: function() {
      logEvent('google_redirect', { rating: selectedRating });
      
      // Log 5-star users for tracking (non-invasive)
      if (selectedRating === 5) {
        apiCall('/api/feedback', 'POST', {
          tenantId: embedData.tenantId,
          siteId: embedData.siteId,
          locationId: embedData.locationId,
          rating: 5,
          message: '[5-star review - redirected to Google]',
          contactEmail: null,
          contactPhone: null,
          sessionId
        });
      }
      
      window.open(config.googleReviewUrl, '_blank');
      setTimeout(() => {
        window.GoogleReviewsEmbed.closeModal();
      }, 500);
    }
  };

  function openModal() {
    window.GoogleReviewsEmbed.openModal();
  }

  function closeModal() {
    window.GoogleReviewsEmbed.closeModal();
  }

  // Initialize
  async function init() {
    embedData = getScriptData();
    
    if (!embedData || !embedData.tenantId || !embedData.siteId || !embedData.locationId) {
      console.error('Google Reviews Embed: Missing required data attributes');
      return;
    }

    // Fetch configuration
    const configUrl = `/api/config?tenantId=${embedData.tenantId}&siteId=${embedData.siteId}&locationId=${embedData.locationId}`;
    const result = await apiCall(configUrl);

    if (!result || !result.success) {
      console.error('Google Reviews Embed: Failed to load configuration');
      return;
    }

    config = result.config;
    console.log('Google Reviews Embed initialized:', config);

    // Inject styles and create UI
    injectStyles();
    createButton();
    createModal();

    // Auto-open if URL parameter is present (for QR codes)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openReview') === '1') {
      setTimeout(() => {
        window.GoogleReviewsEmbed.openModal();
      }, 500);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
