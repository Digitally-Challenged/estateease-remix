/**
 * Security monitoring utilities for EstateEase
 * Implements real-time security event tracking and threat detection
 */

import { getDatabase } from "../database";

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  event_type:
    | "login_attempt"
    | "file_upload"
    | "data_access"
    | "session_anomaly"
    | "authentication_failure";
  user_id?: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  risk_level: "low" | "medium" | "high" | "critical";
  details: string;
  session_id?: string;
}

export interface SecurityMetric {
  metric_name: string;
  metric_value: number;
  threshold: number;
  status: "safe" | "warning" | "critical";
  timestamp: Date;
}

/**
 * Log a security event to the database
 */
export function logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp">): string {
  const db = getDatabase();
  const eventId = `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Create security_events table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS security_events (
        id TEXT PRIMARY KEY,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        event_type TEXT NOT NULL,
        user_id TEXT,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        success BOOLEAN DEFAULT 0,
        risk_level TEXT DEFAULT 'low',
        details TEXT,
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_security_events_risk_level ON security_events(risk_level);
    `);

    const stmt = db.prepare(`
      INSERT INTO security_events (
        id, event_type, user_id, ip_address, user_agent, 
        success, risk_level, details, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      eventId,
      event.event_type,
      event.user_id || null,
      event.ip_address,
      event.user_agent,
      event.success ? 1 : 0,
      event.risk_level,
      event.details,
      event.session_id || null,
    );

    // Check for suspicious patterns
    checkForSuspiciousActivity(event);

    return eventId;
  } catch (error) {
    console.error("Failed to log security event:", error);
    throw error;
  }
}

/**
 * Check for suspicious activity patterns
 */
function checkForSuspiciousActivity(event: Omit<SecurityEvent, "id" | "timestamp">) {
  const db = getDatabase();

  try {
    // Check for multiple failed login attempts from same IP
    if (event.event_type === "login_attempt" && !event.success) {
      const recentFailures = db
        .prepare(
          `
        SELECT COUNT(*) as count 
        FROM security_events 
        WHERE event_type = 'login_attempt' 
          AND success = 0 
          AND ip_address = ? 
          AND timestamp > datetime('now', '-1 hour')
      `,
        )
        .get(event.ip_address) as { count: number };

      if (recentFailures.count >= 5) {
        logSecurityEvent({
          event_type: "authentication_failure",
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          success: false,
          risk_level: "high",
          details: `Multiple failed login attempts detected from IP ${event.ip_address}: ${recentFailures.count} failures in past hour`,
        });
      }
    }

    // Check for unusual file upload patterns
    if (event.event_type === "file_upload" && event.user_id) {
      const recentUploads = db
        .prepare(
          `
        SELECT COUNT(*) as count 
        FROM security_events 
        WHERE event_type = 'file_upload' 
          AND user_id = ? 
          AND timestamp > datetime('now', '-1 hour')
      `,
        )
        .get(event.user_id) as { count: number };

      if (recentUploads.count >= 20) {
        logSecurityEvent({
          event_type: "session_anomaly",
          user_id: event.user_id,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          success: false,
          risk_level: "medium",
          details: `Unusual file upload activity detected: ${recentUploads.count} uploads in past hour`,
        });
      }
    }
  } catch (error) {
    console.error("Failed to check for suspicious activity:", error);
  }
}

/**
 * Get recent security events
 */
export function getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
  const db = getDatabase();

  try {
    const events = db
      .prepare(
        `
      SELECT * FROM security_events 
      ORDER BY timestamp DESC 
      LIMIT ?
    `,
      )
      .all(limit) as any[];

    return events.map((event) => ({
      id: event.id,
      timestamp: new Date(event.timestamp),
      event_type: event.event_type,
      user_id: event.user_id,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      success: Boolean(event.success),
      risk_level: event.risk_level,
      details: event.details,
      session_id: event.session_id,
    }));
  } catch (error) {
    console.error("Failed to get recent security events:", error);
    return [];
  }
}

/**
 * Get security metrics for dashboard
 */
export function getSecurityMetrics(): SecurityMetric[] {
  const db = getDatabase();

  try {
    const metrics: SecurityMetric[] = [];

    // Failed login attempts in last 24 hours
    const failedLogins = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM security_events 
      WHERE event_type = 'login_attempt' 
        AND success = 0 
        AND timestamp > datetime('now', '-24 hours')
    `,
      )
      .get() as { count: number };

    metrics.push({
      metric_name: "failed_logins_24h",
      metric_value: failedLogins.count,
      threshold: 10,
      status: failedLogins.count > 10 ? "critical" : failedLogins.count > 5 ? "warning" : "safe",
      timestamp: new Date(),
    });

    // File uploads in last 24 hours
    const fileUploads = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM security_events 
      WHERE event_type = 'file_upload' 
        AND timestamp > datetime('now', '-24 hours')
    `,
      )
      .get() as { count: number };

    metrics.push({
      metric_name: "file_uploads_24h",
      metric_value: fileUploads.count,
      threshold: 100,
      status: fileUploads.count > 100 ? "warning" : "safe",
      timestamp: new Date(),
    });

    // High-risk events in last 24 hours
    const highRiskEvents = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM security_events 
      WHERE risk_level IN ('high', 'critical') 
        AND timestamp > datetime('now', '-24 hours')
    `,
      )
      .get() as { count: number };

    metrics.push({
      metric_name: "high_risk_events_24h",
      metric_value: highRiskEvents.count,
      threshold: 5,
      status: highRiskEvents.count > 5 ? "critical" : highRiskEvents.count > 2 ? "warning" : "safe",
      timestamp: new Date(),
    });

    return metrics;
  } catch (error) {
    console.error("Failed to get security metrics:", error);
    return [];
  }
}

/**
 * Monitor authentication events
 */
export function monitorAuthentication(request: Request, success: boolean, userId?: string) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("User-Agent") || "Unknown";

  logSecurityEvent({
    event_type: "login_attempt",
    user_id: userId,
    ip_address: ip,
    user_agent: userAgent,
    success,
    risk_level: success ? "low" : "medium",
    details: success ? "Successful authentication" : "Failed authentication attempt",
  });
}

/**
 * Monitor file upload events
 */
export function monitorFileUpload(
  request: Request,
  userId: string,
  filename: string,
  fileSize: number,
  success: boolean,
) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("User-Agent") || "Unknown";

  logSecurityEvent({
    event_type: "file_upload",
    user_id: userId,
    ip_address: ip,
    user_agent: userAgent,
    success,
    risk_level: "low",
    details: success
      ? `File uploaded: ${filename} (${fileSize} bytes)`
      : `Failed file upload attempt: ${filename}`,
  });
}

/**
 * Monitor data access events
 */
export function monitorDataAccess(
  request: Request,
  userId: string,
  dataType: string,
  recordId?: string,
) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("User-Agent") || "Unknown";

  logSecurityEvent({
    event_type: "data_access",
    user_id: userId,
    ip_address: ip,
    user_agent: userAgent,
    success: true,
    risk_level: "low",
    details: recordId ? `Accessed ${dataType} record: ${recordId}` : `Accessed ${dataType} data`,
  });
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  // Check for forwarded IP addresses
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("X-Real-IP");
  if (realIP) {
    return realIP;
  }

  // Fallback to connection remote address (may not be available in all environments)
  return "127.0.0.1"; // Default for development
}

/**
 * Clean up old security events (retain for 90 days)
 */
export function cleanupOldSecurityEvents() {
  const db = getDatabase();

  try {
    db
      .prepare(
        `
      DELETE FROM security_events
      WHERE timestamp < datetime('now', '-90 days')
    `,
      )
      .run();
  } catch (error) {
    console.error("Failed to cleanup old security events:", error);
  }
}
