/**
 * Mock database for testing without PostgreSQL
 * Returns sample data that matches the real database structure
 */

export const mockConfig = {
  success: true,
  config: {
    tenantId: 'tenant_demo',
    tenantName: 'Demo Company',
    siteId: 'site_demo_main',
    siteDomain: 'demo.example.com',
    locationId: 'loc_demo_hq',
    locationName: 'Demo HQ',
    placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    branding: {
      primaryColor: '#4285F4',
      buttonText: 'Leave a Google Review'
    },
    settings: {
      collectFeedback: true,
      feedbackBeforeReview: false
    }
  }
};

export function mockLogEvent(data: any) {
  console.log('📝 [MOCK] Event logged:', data);
  return {
    success: true,
    eventId: Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString()
  };
}

export function mockSubmitFeedback(data: any) {
  console.log('💬 [MOCK] Feedback received:', data);
  return {
    success: true,
    feedbackId: Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString()
  };
}
