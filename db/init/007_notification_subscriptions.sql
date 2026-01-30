-- Create notification_subscriptions table for multi-device push notifications
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id INTEGER REFERENCES user_devices(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Create indexes for notification_subscriptions
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_user ON notification_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_device ON notification_subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_active ON notification_subscriptions(is_active);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_notification_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_subscription_timestamp
BEFORE UPDATE ON notification_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_notification_subscription_timestamp();

-- Link existing notification subscriptions to devices (if they exist)
-- Note: This will be done when users register their devices

-- Add comments
COMMENT ON TABLE notification_subscriptions IS 'Stores push notification subscriptions for each user device';
COMMENT ON COLUMN notification_subscriptions.endpoint IS 'Push notification endpoint URL';
COMMENT ON COLUMN notification_subscriptions.p256dh IS 'Public key for encryption';
COMMENT ON COLUMN notification_subscriptions.auth IS 'Authentication secret';
