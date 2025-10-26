/**
 * Google Reviews Embed Script
 * Version 1.0.0
 * 
 * Embeddable widget for collecting Google Reviews and optional private feedback.
 * 
 * Usage:
 * <script src="https://your-cdn.com/embed/embed.js" 
 *         data-tenant-id="tenant_abc" 
 *         data-site-id="site_xyz" 
 *         data-location-id="loc_123"
 *         data-api-url="http://localhost:3000">
 * </script>
 */

(function() {
  'use strict';

  // Configuration
  let config = null;
  let embedData = null;
  let sessionId = generateSessionId();

  // Generate unique session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get script data attributes
  function getScriptData() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('embed.js')) {
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
        backdrop-filter: blur(10px);
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
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        align-items: center;
        justify-content: center;
      }
      .gr-embed-modal.active {
        display: flex !important;
      }
      .gr-embed-modal-content {
        background: white;
        padding: 32px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        position: relative;
      }
      .gr-embed-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 32px;
        height: 32px;
        line-height: 32px;
      }
      .gr-embed-close:hover {
        color: #333;
      }
      .gr-embed-title {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 16px 0;
        color: #333;
      }
      .gr-embed-subtitle {
        font-size: 14px;
        color: #666;
        margin: 0 0 24px 0;
        line-height: 1.5;
      }
      .gr-embed-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .gr-embed-action-btn {
        padding: 16px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
        border: 2px solid #e0e0e0;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
      }
      .gr-embed-action-btn.primary {
        background-color: ${primaryColor};
        color: white;
        border-color: ${primaryColor};
      }
      .gr-embed-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .gr-embed-feedback-form {
        display: none;
      }
      .gr-embed-feedback-form.active {
        display: block;
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
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }
      .gr-embed-textarea {
        resize: vertical;
        min-height: 100px;
      }
      .gr-embed-rating {
        display: flex;
        gap: 8px;
      }
      .gr-embed-star {
        font-size: 32px;
        cursor: pointer;
        color: #ddd;
        transition: color 0.2s;
      }
      .gr-embed-star.active,
      .gr-embed-star:hover {
        color: #FFD700;
      }
      .gr-embed-submit {
        background-color: ${primaryColor};
        color: white;
        border: none;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        width: 100%;
      }
      .gr-embed-success {
        text-align: center;
        padding: 24px;
      }
      .gr-embed-success-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  // Create button widget
  function createButton() {
    const button = document.createElement('button');
    button.className = 'gr-embed-button';
    button.textContent = config.branding?.buttonText || 'Leave a Google Review';
    button.onclick = openModal;
    document.body.appendChild(button);

    // Position button (bottom left by default)
    button.style.position = 'fixed';
    button.style.bottom = '24px';
    button.style.left = '24px';
    button.style.zIndex = '9999';

    logEvent('widget_loaded');
  }

  // Create modal
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'gr-embed-modal';
    modal.id = 'gr-embed-modal';

    modal.innerHTML = `
      <div class="gr-embed-modal-content">
        <button class="gr-embed-close" onclick="window.GoogleReviewsEmbed.closeModal()">&times;</button>
        
        <div id="gr-embed-main-view">
          <h2 class="gr-embed-title">Share Your Experience</h2>
          <p class="gr-embed-subtitle">We'd love to hear about your experience with ${config.locationName || 'us'}!</p>
          
          <div class="gr-embed-actions">
            <button class="gr-embed-action-btn primary" onclick="window.GoogleReviewsEmbed.openGoogleReview()">
              ⭐ Leave a Google Review
            </button>
            ${config.settings?.collectFeedback ? `
              <button class="gr-embed-action-btn" onclick="window.GoogleReviewsEmbed.showFeedbackForm()">
                💬 Share Private Feedback
              </button>
            ` : ''}
          </div>
        </div>

        ${config.settings?.collectFeedback ? `
          <div id="gr-embed-feedback-form" class="gr-embed-feedback-form">
            <h2 class="gr-embed-title">Share Your Feedback</h2>
            <p class="gr-embed-subtitle">Your feedback helps us improve.</p>
            
            <form id="gr-feedback-form">
              <div class="gr-embed-form-group">
                <label class="gr-embed-label">Rating (optional)</label>
                <div class="gr-embed-rating" id="gr-rating">
                  <span class="gr-embed-star" data-rating="1">★</span>
                  <span class="gr-embed-star" data-rating="2">★</span>
                  <span class="gr-embed-star" data-rating="3">★</span>
                  <span class="gr-embed-star" data-rating="4">★</span>
                  <span class="gr-embed-star" data-rating="5">★</span>
                </div>
              </div>
              
              <div class="gr-embed-form-group">
                <label class="gr-embed-label">Your Feedback *</label>
                <textarea class="gr-embed-textarea" id="gr-feedback-message" required></textarea>
              </div>
              
              <div class="gr-embed-form-group">
                <label class="gr-embed-label">Email (optional)</label>
                <input type="email" class="gr-embed-input" id="gr-feedback-email" />
              </div>
              
              <button type="submit" class="gr-embed-submit">Submit Feedback</button>
            </form>
          </div>

          <div id="gr-embed-success" class="gr-embed-feedback-form">
            <div class="gr-embed-success">
              <div class="gr-embed-success-icon">✓</div>
              <h2 class="gr-embed-title">Thank You!</h2>
              <p class="gr-embed-subtitle">Your feedback has been received.</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(modal);

    // Setup rating stars
    if (config.settings?.collectFeedback) {
      setupRatingStars();
      setupFeedbackForm();
    }

    // Close modal on backdrop click
    modal.onclick = function(e) {
      if (e.target === modal) {
        closeModal();
      }
    };
  }

  // Setup rating stars interaction
  function setupRatingStars() {
    let selectedRating = 0;
    const stars = document.querySelectorAll('.gr-embed-star');
    
    stars.forEach(star => {
      star.onclick = function() {
        selectedRating = parseInt(this.getAttribute('data-rating'));
        updateStars(selectedRating);
      };
    });

    function updateStars(rating) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    }
  }

  // Setup feedback form submission
  function setupFeedbackForm() {
    const form = document.getElementById('gr-feedback-form');
    form.onsubmit = async function(e) {
      e.preventDefault();
      
      const rating = document.querySelectorAll('.gr-embed-star.active').length || null;
      const message = document.getElementById('gr-feedback-message').value;
      const email = document.getElementById('gr-feedback-email').value;

      const result = await apiCall('/api/feedback', 'POST', {
        tenantId: embedData.tenantId,
        siteId: embedData.siteId,
        locationId: embedData.locationId,
        rating,
        message,
        contactEmail: email || null,
        sessionId
      });

      if (result && result.success) {
        logEvent('feedback_submitted', { rating });
        showSuccessView();
      }
    };
  }

  // Public API
  window.GoogleReviewsEmbed = {
    openModal: function() {
      const modal = document.getElementById('gr-embed-modal');
      modal.classList.add('active');
      logEvent('button_clicked');
    },

    closeModal: function() {
      const modal = document.getElementById('gr-embed-modal');
      modal.classList.remove('active');
      logEvent('widget_closed');
    },

    openGoogleReview: function() {
      logEvent('review_started');
      window.open(config.googleReviewUrl, '_blank');
      setTimeout(() => {
        logEvent('review_completed');
      }, 1000);
    },

    showFeedbackForm: function() {
      document.getElementById('gr-embed-main-view').style.display = 'none';
      document.getElementById('gr-embed-feedback-form').classList.add('active');
      logEvent('feedback_opened');
    }
  };

  function showSuccessView() {
    document.getElementById('gr-embed-feedback-form').classList.remove('active');
    document.getElementById('gr-embed-success').classList.add('active');
    setTimeout(() => {
      window.GoogleReviewsEmbed.closeModal();
    }, 3000);
  }

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
      console.error('Google Reviews Embed: Missing required data attributes (data-tenant-id, data-site-id, data-location-id)');
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
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
