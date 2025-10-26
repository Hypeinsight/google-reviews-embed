-- Enhanced Feedback System Migration
-- Adds support for tiered feedback collection and response tracking

-- Add new columns to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS feedback_categories TEXT[];
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS contact_preference VARCHAR(20) DEFAULT 'none';
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS urgency_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS response_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS responded_by VARCHAR(255);
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS response_notes TEXT;

-- Create index for urgency flags (for quick filtering in admin)
CREATE INDEX IF NOT EXISTS idx_feedback_urgency ON feedback(urgency_flag) WHERE urgency_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(response_status);

-- Comments for documentation
COMMENT ON COLUMN feedback.feedback_categories IS 'Array of issue categories selected by user (service, product, wait_time, staff, pricing, cleanliness, other)';
COMMENT ON COLUMN feedback.contact_preference IS 'Preferred contact method: email, phone, or none';
COMMENT ON COLUMN feedback.urgency_flag IS 'TRUE for 1-2 star ratings requiring immediate attention';
COMMENT ON COLUMN feedback.response_status IS 'Tracking: pending, contacted, resolved, no_action_needed';
