-- ================================================================
-- User Devices and Activity Logs System
-- ================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- ================================================================
-- User Devices Table (for multi-device push notifications)
-- ================================================================
CREATE TABLE user_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'web', 'mobile', 'tablet', 'desktop'
    device_name VARCHAR(200), -- User-friendly name: "Chrome on Windows", "Safari on iPhone"
    browser VARCHAR(100), -- Chrome, Firefox, Safari, Edge, etc.
    browser_version VARCHAR(50),
    os VARCHAR(100), -- Windows, macOS, Linux, iOS, Android
    os_version VARCHAR(50),
    device_model VARCHAR(200), -- iPhone 15 Pro, Samsung Galaxy S24, etc.
    app_version VARCHAR(50),
    ip_address VARCHAR(45), -- IPv4 or IPv6
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_token)
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_active ON user_devices(is_active);
CREATE INDEX idx_user_devices_last_used ON user_devices(last_used_at);
CREATE INDEX idx_user_devices_device_type ON user_devices(device_type);

-- ================================================================
-- User Sessions Table (for tracking active sessions)
-- ================================================================
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_id INTEGER REFERENCES user_devices(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity_at);

-- ================================================================
-- User Activity Logs Table (comprehensive audit logging)
-- ================================================================
CREATE TABLE user_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id INTEGER REFERENCES user_sessions(id) ON DELETE SET NULL,
    device_id INTEGER REFERENCES user_devices(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'view', 'export', etc.
    module VARCHAR(100), -- 'users', 'customers', 'orders', 'hr', 'insurance', etc.
    entity_type VARCHAR(100), -- 'user', 'customer', 'order', 'employee', etc.
    entity_id INTEGER, -- ID of the affected entity
    
    -- Request Details
    method VARCHAR(10), -- GET, POST, PUT, DELETE, PATCH
    endpoint TEXT, -- /api/users/123
    status_code INTEGER, -- 200, 201, 400, 401, 500, etc.
    
    -- Change Details
    old_values JSONB, -- Previous state before change
    new_values JSONB, -- New state after change
    changes JSONB, -- Specific fields that changed
    
    -- Context
    description TEXT, -- Human-readable description
    description_ar TEXT, -- Arabic description
    metadata JSONB, -- Additional context-specific data
    
    -- Request Information
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),
    device_type VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    referrer TEXT,
    
    -- Performance
    duration_ms INTEGER, -- Request duration in milliseconds
    
    -- Security
    is_suspicious BOOLEAN DEFAULT false,
    risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON user_activity_logs(action);
CREATE INDEX idx_activity_logs_module ON user_activity_logs(module);
CREATE INDEX idx_activity_logs_entity ON user_activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_ip ON user_activity_logs(ip_address);
CREATE INDEX idx_activity_logs_suspicious ON user_activity_logs(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX idx_activity_logs_risk ON user_activity_logs(risk_level);
CREATE INDEX idx_activity_logs_session ON user_activity_logs(session_id);
CREATE INDEX idx_activity_logs_status ON user_activity_logs(status_code);

-- ================================================================
-- Update notification_subscriptions to use devices
-- ================================================================
-- Add device_id to existing notification_subscriptions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='notification_subscriptions' 
                   AND column_name='device_id') THEN
        ALTER TABLE notification_subscriptions 
        ADD COLUMN device_id INTEGER REFERENCES user_devices(id) ON DELETE CASCADE;
        
        CREATE INDEX idx_notification_subscriptions_device ON notification_subscriptions(device_id);
    END IF;
END $$;

-- ================================================================
-- Triggers
-- ================================================================

-- Update user_devices.updated_at
CREATE OR REPLACE FUNCTION update_user_devices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_devices_updated_at
BEFORE UPDATE ON user_devices
FOR EACH ROW
EXECUTE FUNCTION update_user_devices_timestamp();

-- Update user_sessions.updated_at
CREATE OR REPLACE FUNCTION update_user_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_sessions_updated_at
BEFORE UPDATE ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_sessions_timestamp();

-- ================================================================
-- Helper Functions
-- ================================================================

-- Get user's active devices
CREATE OR REPLACE FUNCTION get_user_active_devices(p_user_id INTEGER)
RETURNS TABLE (
    device_id INTEGER,
    device_name VARCHAR,
    device_type VARCHAR,
    device_token TEXT,
    last_used_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        device_name,
        device_type,
        device_token,
        last_used_at
    FROM user_devices
    WHERE user_id = p_user_id
    AND is_active = true
    ORDER BY last_used_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_user_id INTEGER,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    action VARCHAR,
    count BIGINT,
    last_performed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ual.action,
        COUNT(*) as count,
        MAX(ual.created_at) as last_performed
    FROM user_activity_logs ual
    WHERE ual.user_id = p_user_id
    AND ual.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY ual.action
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Get suspicious activities
CREATE OR REPLACE FUNCTION get_suspicious_activities(
    p_user_id INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    log_id BIGINT,
    user_id INTEGER,
    username VARCHAR,
    action VARCHAR,
    ip_address VARCHAR,
    risk_level VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ual.id,
        ual.user_id,
        u.username,
        ual.action,
        ual.ip_address,
        ual.risk_level,
        ual.created_at
    FROM user_activity_logs ual
    LEFT JOIN users u ON ual.user_id = u.id
    WHERE (p_user_id IS NULL OR ual.user_id = p_user_id)
    AND ual.is_suspicious = true
    ORDER BY ual.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Clean old activity logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs(p_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_activity_logs
    WHERE created_at < NOW() - (p_days || ' days')::INTERVAL
    AND is_suspicious = false
    AND risk_level IN ('low', 'medium');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Comments
-- ================================================================

COMMENT ON TABLE user_devices IS 'Stores user devices for multi-device push notifications';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions across devices';
COMMENT ON TABLE user_activity_logs IS 'Comprehensive audit log of all user actions';

COMMENT ON COLUMN user_devices.device_token IS 'Push notification token for the device';
COMMENT ON COLUMN user_devices.device_type IS 'Type of device: web, mobile, tablet, desktop';
COMMENT ON COLUMN user_activity_logs.action IS 'Type of action performed';
COMMENT ON COLUMN user_activity_logs.old_values IS 'State before the change (JSON)';
COMMENT ON COLUMN user_activity_logs.new_values IS 'State after the change (JSON)';
COMMENT ON COLUMN user_activity_logs.is_suspicious IS 'Flag for suspicious activity detection';

-- ================================================================
-- Sample Data (for testing)
-- ================================================================

-- This will be populated automatically when users subscribe to notifications
-- and when they perform actions in the system
