-- Update pricing tiers with real Stripe Price IDs
-- Run this after running migration_billing.sql

UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvNAIJU39QO7T6WmRR217n' WHERE id = 'basic';
UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvNlIJU39QO7T618xVVqpd' WHERE id = 'starter';
UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvOCIJU39QO7T6dHHScLp9' WHERE id = 'professional';
UPDATE pricing_tiers SET stripe_price_id = 'price_1SmvOYIJU39QO7T6yMmaQzgy' WHERE id = 'enterprise';

-- Verify the updates
SELECT id, name, monthly_price, stripe_price_id FROM pricing_tiers ORDER BY monthly_price;
