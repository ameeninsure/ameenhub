-- Notifications System
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
    icon VARCHAR(100),
    link VARCHAR(500),
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipient_type VARCHAR(20) NOT NULL, -- 'user' or 'customer'
    recipient_id INTEGER NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create notification subscriptions table (for push notifications)
CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL, -- 'user' or 'customer'
    user_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL, -- Contains p256dh and auth keys
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(endpoint)
);

-- Create indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_subscriptions_user ON notification_subscriptions(user_type, user_id);
CREATE INDEX idx_subscriptions_active ON notification_subscriptions(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notification_subscriptions
CREATE TRIGGER update_notification_subscriptions_updated_at 
    BEFORE UPDATE ON notification_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_subscriptions TO postgres;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE notification_subscriptions_id_seq TO postgres;
