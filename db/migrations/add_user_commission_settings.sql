-- User Commission Settings Table
-- Stores flexible commission rates per user per product type with tier support

CREATE TABLE IF NOT EXISTS user_commission_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_type VARCHAR(100) NOT NULL, -- motor, life, health, travel, property, etc.
  commission_type VARCHAR(20) DEFAULT 'percentage', -- percentage or fixed
  default_rate DECIMAL(5,2) DEFAULT 0, -- Default commission rate
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_type)
);

-- Commission Tiers Table
-- Stores tiered commission rates based on sales amount
CREATE TABLE IF NOT EXISTS user_commission_tiers (
  id SERIAL PRIMARY KEY,
  setting_id INTEGER NOT NULL REFERENCES user_commission_settings(id) ON DELETE CASCADE,
  tier_order INTEGER NOT NULL DEFAULT 1,
  from_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  to_amount DECIMAL(12,2), -- NULL means unlimited
  rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_commission_settings_user_id ON user_commission_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_commission_settings_product_type ON user_commission_settings(product_type);
CREATE INDEX IF NOT EXISTS idx_user_commission_tiers_setting_id ON user_commission_tiers(setting_id);

-- Add comments
COMMENT ON TABLE user_commission_settings IS 'Commission settings per user per insurance product type';
COMMENT ON TABLE user_commission_tiers IS 'Tiered commission rates based on sales volume';
