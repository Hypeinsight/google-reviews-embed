/**
 * Hype Insight Landing Page Script
 * Version 1.0.0
 * 
 * Embeddable script for creating client landing pages on hypeinsight.com
 * Shows client stats, testimonials, and CTA for review management
 * 
 * Usage:
 * <div id="hype-landing-page" data-tenant-id="tenant_demo" data-api-url="https://your-api.com"></div>
 * <script src="landing-page.js"></script>
 */

(function() {
  'use strict';

  // Generate URL slug from business name
  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Get container and config
  function getConfig() {
    const container = document.getElementById('hype-landing-page');
    if (!container) {
      console.error('Hype Landing Page: Container #hype-landing-page not found');
      return null;
    }

    const tenantId = container.getAttribute('data-tenant-id');
    const locationId = container.getAttribute('data-location-id');
    const apiUrl = container.getAttribute('data-api-url') || 'http://localhost:3000';
    const signupUrl = container.getAttribute('data-signup-url') || 'https://hypeinsight.com/contact';

    if (!tenantId) {
      console.error('Hype Landing Page: data-tenant-id is required');
      return null;
    }

    return { container, tenantId, locationId, apiUrl, signupUrl };
  }

  // Fetch landing page data from API
  async function fetchData(apiUrl, tenantId, locationId) {
    try {
      let url = `${apiUrl}/api/landing-page?tenantId=${tenantId}`;
      if (locationId) {
        url += `&locationId=${locationId}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch landing page data');
      }

      return result.data;
    } catch (error) {
      console.error('Hype Landing Page: Error fetching data', error);
      return null;
    }
  }

  // Update browser URL with slug
  function updateURL(tenantName, locationName) {
    const slug = locationName ? generateSlug(locationName) : generateSlug(tenantName);
    const newPath = `/reviews/${slug}`;
    
    if (window.location.pathname !== newPath) {
      window.history.replaceState({}, '', newPath);
      document.title = `${tenantName} - Powered by Hype Insight`;
    }
  }

  // Format number with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Render the landing page
  function render(container, data, signupUrl) {
    const { tenantName, locationName, locationAddress, logo, stats, testimonial } = data;
    
    const displayName = locationName || tenantName;
    const hasStats = stats.reviewsCollected > 0 || stats.feedbackSubmitted > 0 || stats.totalInteractions > 0;

    // Update page URL
    updateURL(tenantName, locationName);

    // Inject styles
    injectStyles();

    // Build HTML
    const html = `
      <div class="hype-landing-container">
        <!-- Header -->
        <header class="hype-landing-header">
          <div class="hype-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#46B646"/>
              <path d="M12 20h7m0 0v-7m0 7v7m9-7h-7" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span>Hype Insight</span>
          </div>
        </header>

        <!-- Hero Section -->
        <section class="hype-landing-hero">
          ${logo ? `<img src="${logo}" alt="${displayName}" class="hype-client-logo" />` : ''}
          <h1 class="hype-landing-title">${displayName}</h1>
          ${locationAddress ? `<p class="hype-landing-address">${locationAddress}</p>` : ''}
          <p class="hype-landing-subtitle">Powered by Hype Insight's Review Management System</p>
        </section>

        ${hasStats ? `
        <!-- Stats Section -->
        <section class="hype-landing-stats">
          <div class="hype-stat-card">
            <div class="hype-stat-number">${formatNumber(stats.reviewsCollected)}</div>
            <div class="hype-stat-label">Google Reviews Collected</div>
          </div>
          <div class="hype-stat-card">
            <div class="hype-stat-number">${formatNumber(stats.feedbackSubmitted)}</div>
            <div class="hype-stat-label">Feedback Submissions</div>
          </div>
          <div class="hype-stat-card">
            <div class="hype-stat-number">${formatNumber(stats.totalInteractions)}</div>
            <div class="hype-stat-label">Total Interactions</div>
          </div>
        </section>
        ` : ''}

        ${testimonial ? `
        <!-- Testimonial Section -->
        <section class="hype-landing-testimonial">
          <h2 class="hype-section-title">Recent Feedback</h2>
          <div class="hype-testimonial-card">
            <div class="hype-testimonial-stars">
              ${'★'.repeat(testimonial.rating)}
            </div>
            <p class="hype-testimonial-message">"${testimonial.message}"</p>
            <p class="hype-testimonial-date">${testimonial.date}</p>
          </div>
        </section>
        ` : ''}

        <!-- CTA Section -->
        <section class="hype-landing-cta">
          <h2 class="hype-cta-title">Want This For Your Business?</h2>
          <p class="hype-cta-text">
            Get more Google Reviews and customer feedback with Hype Insight's easy-to-implement review management system.
          </p>
          <a href="${signupUrl}" class="hype-cta-button" target="_blank" rel="noopener">
            Get Started Today
          </a>
        </section>

        <!-- Footer -->
        <footer class="hype-landing-footer">
          <p>&copy; ${new Date().getFullYear()} Hype Insight. All rights reserved.</p>
          <p><a href="https://hypeinsight.com" target="_blank" rel="noopener">hypeinsight.com</a></p>
        </footer>
      </div>
    `;

    container.innerHTML = html;
  }

  // Inject CSS styles (Hype Insight branding)
  function injectStyles() {
    if (document.getElementById('hype-landing-styles')) return;

    const style = document.createElement('style');
    style.id = 'hype-landing-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      .hype-landing-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0;
        color: #02202E;
        background: #FFFFFF;
      }

      /* Header */
      .hype-landing-header {
        padding: 24px 20px;
        background: #02202E;
        border-bottom: 3px solid #46B646;
      }

      .hype-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #FFFFFF;
        font-size: 20px;
        font-weight: 700;
      }

      /* Hero Section */
      .hype-landing-hero {
        text-align: center;
        padding: 60px 20px;
        background: linear-gradient(135deg, #F8F8F8 0%, #FFFFFF 100%);
      }

      .hype-client-logo {
        max-width: 200px;
        max-height: 100px;
        margin-bottom: 24px;
        object-fit: contain;
      }

      .hype-landing-title {
        font-size: 48px;
        font-weight: 700;
        color: #02202E;
        margin: 0 0 12px 0;
        line-height: 1.2;
      }

      .hype-landing-address {
        font-size: 18px;
        color: #666666;
        margin: 0 0 16px 0;
      }

      .hype-landing-subtitle {
        font-size: 20px;
        color: #46B646;
        font-weight: 600;
        margin: 0;
      }

      /* Stats Section */
      .hype-landing-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        padding: 60px 20px;
        background: #FFFFFF;
      }

      .hype-stat-card {
        background: linear-gradient(135deg, #46B646 0%, #3a9a3a 100%);
        color: #FFFFFF;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 4px 16px rgba(70, 182, 70, 0.2);
      }

      .hype-stat-number {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .hype-stat-label {
        font-size: 16px;
        font-weight: 500;
        opacity: 0.95;
      }

      /* Testimonial Section */
      .hype-landing-testimonial {
        padding: 60px 20px;
        background: #F8F8F8;
      }

      .hype-section-title {
        font-size: 32px;
        font-weight: 700;
        color: #02202E;
        text-align: center;
        margin: 0 0 32px 0;
      }

      .hype-testimonial-card {
        max-width: 700px;
        margin: 0 auto;
        background: #FFFFFF;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      }

      .hype-testimonial-stars {
        font-size: 32px;
        color: #FFCB2B;
        margin-bottom: 16px;
      }

      .hype-testimonial-message {
        font-size: 18px;
        line-height: 1.6;
        color: #02202E;
        margin: 0 0 16px 0;
        font-style: italic;
      }

      .hype-testimonial-date {
        font-size: 14px;
        color: #666666;
        margin: 0;
      }

      /* CTA Section */
      .hype-landing-cta {
        padding: 80px 20px;
        background: linear-gradient(135deg, #02202E 0%, #04344a 100%);
        color: #FFFFFF;
        text-align: center;
      }

      .hype-cta-title {
        font-size: 40px;
        font-weight: 700;
        margin: 0 0 20px 0;
      }

      .hype-cta-text {
        font-size: 18px;
        line-height: 1.6;
        max-width: 600px;
        margin: 0 auto 32px auto;
        opacity: 0.9;
      }

      .hype-cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #46B646 0%, #3a9a3a 100%);
        color: #FFFFFF;
        padding: 18px 48px;
        font-size: 18px;
        font-weight: 700;
        border-radius: 50px;
        text-decoration: none;
        transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(70, 182, 70, 0.3);
      }

      .hype-cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(70, 182, 70, 0.4);
      }

      /* Footer */
      .hype-landing-footer {
        padding: 40px 20px;
        background: #02202E;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
        font-size: 14px;
      }

      .hype-landing-footer p {
        margin: 8px 0;
      }

      .hype-landing-footer a {
        color: #46B646;
        text-decoration: none;
      }

      .hype-landing-footer a:hover {
        text-decoration: underline;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hype-landing-title {
          font-size: 32px;
        }

        .hype-cta-title {
          font-size: 28px;
        }

        .hype-stat-number {
          font-size: 36px;
        }

        .hype-landing-stats {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Initialize
  async function init() {
    const config = getConfig();
    if (!config) return;

    const { container, tenantId, locationId, apiUrl, signupUrl } = config;

    // Show loading state
    container.innerHTML = '<div style="text-align: center; padding: 60px 20px; font-family: sans-serif; color: #666;">Loading...</div>';

    // Fetch data
    const data = await fetchData(apiUrl, tenantId, locationId);
    
    if (!data) {
      container.innerHTML = '<div style="text-align: center; padding: 60px 20px; font-family: sans-serif; color: #E74C3C;">Failed to load landing page data.</div>';
      return;
    }

    // Render page
    render(container, data, signupUrl);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
