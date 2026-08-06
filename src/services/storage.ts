import type { LoginEvent, Alert, ModelMetric, AuditLogEntry, UserBaseline } from '../types/security';
import { generateInitialEvents, generateInitialAlerts, INITIAL_MODEL_METRIC, INITIAL_AUDIT_LOGS, MOCK_BASELINES } from './mockData';

const KEYS = {
  EVENTS: 'ps2_cloudguard_events',
  ALERTS: 'ps2_cloudguard_alerts',
  METRICS: 'ps2_cloudguard_metrics',
  AUDIT: 'ps2_cloudguard_audit',
  BASELINES: 'ps2_cloudguard_baselines'
};

export const StorageService = {
  getEvents(): LoginEvent[] {
    try {
      const data = localStorage.getItem(KEYS.EVENTS);
      return data ? JSON.parse(data) : generateInitialEvents();
    } catch {
      return generateInitialEvents();
    }
  },
  saveEvents(events: LoginEvent[]): void {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  getAlerts(): Alert[] {
    try {
      const data = localStorage.getItem(KEYS.ALERTS);
      if (data) return JSON.parse(data);
      const initialEvents = this.getEvents();
      return generateInitialAlerts(initialEvents);
    } catch {
      return generateInitialAlerts(generateInitialEvents());
    }
  },
  saveAlerts(alerts: Alert[]): void {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  },

  getModelMetric(): ModelMetric {
    try {
      const data = localStorage.getItem(KEYS.METRICS);
      return data ? JSON.parse(data) : INITIAL_MODEL_METRIC;
    } catch {
      return INITIAL_MODEL_METRIC;
    }
  },
  saveModelMetric(metric: ModelMetric): void {
    localStorage.setItem(KEYS.METRICS, JSON.stringify(metric));
  },

  getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(KEYS.AUDIT);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },
  saveAuditLogs(logs: AuditLogEntry[]): void {
    localStorage.setItem(KEYS.AUDIT, JSON.stringify(logs));
  },

  getBaselines(): Record<string, UserBaseline> {
    try {
      const data = localStorage.getItem(KEYS.BASELINES);
      return data ? JSON.parse(data) : MOCK_BASELINES;
    } catch {
      return MOCK_BASELINES;
    }
  },
  saveBaselines(baselines: Record<string, UserBaseline>): void {
    localStorage.setItem(KEYS.BASELINES, JSON.stringify(baselines));
  },

  resetAllData(): void {
    localStorage.removeItem(KEYS.EVENTS);
    localStorage.removeItem(KEYS.ALERTS);
    localStorage.removeItem(KEYS.METRICS);
    localStorage.removeItem(KEYS.AUDIT);
    localStorage.removeItem(KEYS.BASELINES);
  }
};
