import type { UserProfile, UserBaseline, LoginEvent, Alert, ModelMetric, AuditLogEntry } from '../types/security';
import { extractAndClassifyEvent } from './mlEngine';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr_admin_01',
    email: 'sarah.connor@cyberdyne-bank.com',
    fullName: 'Sarah Connor (Security Lead)',
    role: 'admin',
    homeCountry: 'United States',
    homeCity: 'San Francisco',
    typicalLat: 37.7749,
    typicalLng: -122.4194,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'usr_alex_02',
    email: 'alex.mercer@fintech.io',
    fullName: 'Alex Mercer',
    role: 'user',
    homeCountry: 'United States',
    homeCity: 'New York',
    typicalLat: 40.7128,
    typicalLng: -74.0060,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: '2025-02-01T10:30:00Z'
  },
  {
    id: 'usr_elena_03',
    email: 'elena.r@globalpay.org',
    fullName: 'Elena Rostova',
    role: 'user',
    homeCountry: 'United Kingdom',
    homeCity: 'London',
    typicalLat: 51.5074,
    typicalLng: -0.1278,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    created_at: '2025-02-15T14:20:00Z'
  },
  {
    id: 'usr_kenji_04',
    email: 'kenji.sato@techcorp.jp',
    fullName: 'Kenji Sato',
    role: 'user',
    homeCountry: 'Japan',
    homeCity: 'Tokyo',
    typicalLat: 35.6762,
    typicalLng: 139.6503,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: '2025-03-01T09:15:00Z'
  },
  {
    id: 'usr_priya_05',
    email: 'priya.s@cloudvault.in',
    fullName: 'Priya Sharma',
    role: 'user',
    homeCountry: 'India',
    homeCity: 'Mumbai',
    typicalLat: 19.0760,
    typicalLng: 72.8777,
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    created_at: '2025-03-10T11:45:00Z'
  }
];

const standardWorkHoursHist = [
  0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.03, 0.08, 0.15, 0.18, 0.14, 0.12, 0.10, 0.08, 0.06, 0.03, 0.01, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
];

export const MOCK_BASELINES: Record<string, UserBaseline> = {
  usr_alex_02: {
    userId: 'usr_alex_02',
    typicalCountries: ['United States'],
    typicalCities: ['New York', 'Brooklyn', 'Jersey City'],
    typicalLat: 40.7128,
    typicalLng: -74.0060,
    typicalHoursHistogram: standardWorkHoursHist,
    knownDevices: ['macOS Chrome v122 (fp_alex_mac)', 'iOS Safari v17 (fp_alex_iphone)'],
    updatedAt: '2026-08-01T00:00:00Z'
  },
  usr_elena_03: {
    userId: 'usr_elena_03',
    typicalCountries: ['United Kingdom', 'France'],
    typicalCities: ['London', 'Paris'],
    typicalLat: 51.5074,
    typicalLng: -0.1278,
    typicalHoursHistogram: standardWorkHoursHist,
    knownDevices: ['Windows Edge v121 (fp_elena_win)', 'Android Chrome (fp_elena_pixel)'],
    updatedAt: '2026-08-01T00:00:00Z'
  },
  usr_kenji_04: {
    userId: 'usr_kenji_04',
    typicalCountries: ['Japan'],
    typicalCities: ['Tokyo', 'Yokohama'],
    typicalLat: 35.6762,
    typicalLng: 139.6503,
    typicalHoursHistogram: standardWorkHoursHist,
    knownDevices: ['macOS Safari (fp_kenji_mac)'],
    updatedAt: '2026-08-01T00:00:00Z'
  },
  usr_priya_05: {
    userId: 'usr_priya_05',
    typicalCountries: ['India'],
    typicalCities: ['Mumbai', 'Pune'],
    typicalLat: 19.0760,
    typicalLng: 72.8777,
    typicalHoursHistogram: standardWorkHoursHist,
    knownDevices: ['Linux Firefox (fp_priya_ubuntu)', 'Android Chrome (fp_priya_oneplus)'],
    updatedAt: '2026-08-01T00:00:00Z'
  }
};

const now = new Date();
const timeAgo = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60 * 1000).toISOString();

export function generateInitialEvents(): LoginEvent[] {
  const events: LoginEvent[] = [];

  events.push(
    extractAndClassifyEvent(
      {
        userId: 'usr_alex_02',
        userName: 'Alex Mercer',
        userEmail: 'alex.mercer@fintech.io',
        ipAddress: '198.51.100.42',
        geoCountry: 'United States',
        geoCity: 'New York',
        geoLat: 40.7128,
        geoLng: -74.0060,
        deviceFingerprint: 'fp_alex_mac',
        deviceOS: 'macOS 14.2',
        deviceBrowser: 'Chrome 122.0',
        eventTime: timeAgo(120)
      },
      MOCK_BASELINES['usr_alex_02']
    )
  );

  events.push(
    extractAndClassifyEvent(
      {
        userId: 'usr_alex_02',
        userName: 'Alex Mercer',
        userEmail: 'alex.mercer@fintech.io',
        ipAddress: '185.220.101.5',
        geoCountry: 'Russia',
        geoCity: 'Moscow',
        geoLat: 55.7558,
        geoLng: 37.6173,
        deviceFingerprint: 'fp_unknown_linux_bot',
        deviceOS: 'Linux x86_64',
        deviceBrowser: 'Firefox 115.0 (Tor)',
        eventTime: timeAgo(95)
      },
      MOCK_BASELINES['usr_alex_02']
    )
  );

  events.push(
    extractAndClassifyEvent(
      {
        userId: 'usr_elena_03',
        userName: 'Elena Rostova',
        userEmail: 'elena.r@globalpay.org',
        ipAddress: '81.2.69.142',
        geoCountry: 'United Kingdom',
        geoCity: 'London',
        geoLat: 51.5074,
        geoLng: -0.1278,
        deviceFingerprint: 'fp_elena_win',
        deviceOS: 'Windows 11',
        deviceBrowser: 'Edge 121.0',
        eventTime: timeAgo(70)
      },
      MOCK_BASELINES['usr_elena_03']
    )
  );

  events.push(
    extractAndClassifyEvent(
      {
        userId: 'usr_kenji_04',
        userName: 'Kenji Sato',
        userEmail: 'kenji.sato@techcorp.jp',
        ipAddress: '203.0.113.88',
        geoCountry: 'Japan',
        geoCity: 'Osaka',
        geoLat: 34.6937,
        geoLng: 135.5023,
        deviceFingerprint: 'fp_new_ipad_pro',
        deviceOS: 'iPadOS 17.1',
        deviceBrowser: 'Mobile Safari',
        eventTime: timeAgo(45)
      },
      MOCK_BASELINES['usr_kenji_04']
    )
  );

  events.push(
    extractAndClassifyEvent(
      {
        userId: 'usr_priya_05',
        userName: 'Priya Sharma',
        userEmail: 'priya.s@cloudvault.in',
        ipAddress: '198.51.100.199',
        geoCountry: 'Brazil',
        geoCity: 'São Paulo',
        geoLat: -23.5505,
        geoLng: -46.6333,
        deviceFingerprint: 'fp_credential_stuffing_bot',
        deviceOS: 'Android 10 (Emulated)',
        deviceBrowser: 'HeadlessChrome 110.0',
        eventTime: timeAgo(15)
      },
      MOCK_BASELINES['usr_priya_05']
    )
  );

  events.push(
    extractAndClassifyEvent(
      {
        userId: 'usr_alex_02',
        userName: 'Alex Mercer',
        userEmail: 'alex.mercer@fintech.io',
        ipAddress: '198.51.100.43',
        geoCountry: 'United States',
        geoCity: 'New York',
        geoLat: 40.7128,
        geoLng: -74.0060,
        deviceFingerprint: 'fp_alex_iphone',
        deviceOS: 'iOS 17.3',
        deviceBrowser: 'Mobile Safari',
        eventTime: timeAgo(5)
      },
      MOCK_BASELINES['usr_alex_02']
    )
  );

  return events.sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime());
}

export function generateInitialAlerts(events: LoginEvent[]): Alert[] {
  const alerts: Alert[] = [];
  
  events.forEach(evt => {
    if (evt.classification === 'suspicious' || evt.classification === 'blocked') {
      alerts.push({
        id: `alt_${evt.id.replace('evt_', '')}`,
        loginEventId: evt.id,
        event: evt,
        status: evt.classification === 'blocked' ? 'blocked' : 'flagged',
        createdAt: evt.eventTime,
        userFeedback: null
      });
    }
  });

  return alerts;
}

export const INITIAL_MODEL_METRIC: ModelMetric = {
  version: 'v1.4.2-isolation-forest',
  precision: 0.912,
  recall: 0.885,
  f1Score: 0.898,
  falsePositiveRate: 0.082,
  threshold: 0.40,
  totalEvaluated: 14280,
  accuracy: 0.941,
  geoDrift: 3.2,
  deviceDrift: 4.8,
  timeDrift: 1.5,
  trainedAt: '2026-08-03T12:00:00Z',
  isActive: true
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_101',
    timestamp: timeAgo(120),
    actorId: 'system',
    actorName: 'Sentinel AI Engine',
    actorRole: 'admin',
    action: 'EVENT_CLASSIFIED',
    targetEventId: 'evt_alex_01',
    details: 'Login event evaluated: Normal (Risk Score: 0.045)',
    ipAddress: '198.51.100.42'
  },
  {
    id: 'aud_102',
    timestamp: timeAgo(95),
    actorId: 'system',
    actorName: 'Sentinel AI Engine',
    actorRole: 'admin',
    action: 'ALERT_FLAGGED',
    targetEventId: 'evt_alex_02',
    details: 'Suspicious login event flagged: Moscow, Russia (Risk Score: 0.825). Alert alt_alex_02 generated.',
    riskScore: 0.825,
    ipAddress: '185.220.101.5'
  },
  {
    id: 'aud_103',
    timestamp: timeAgo(15),
    actorId: 'system',
    actorName: 'Sentinel AI Engine',
    actorRole: 'admin',
    action: 'AUTO_BLOCKED',
    targetEventId: 'evt_priya_01',
    details: 'High-risk session auto-blocked (Risk Score: 0.890 exceeds auto-block threshold 0.750).',
    riskScore: 0.890,
    ipAddress: '198.51.100.199'
  }
];
