export type UserRole = 'admin' | 'user';

export type ClassificationType = 'normal' | 'suspicious' | 'blocked';

export type AlertStatus = 'open' | 'flagged' | 'approved' | 'blocked';

export type UserFeedbackType = 'confirmed_legitimate' | 'reported_intrusion' | null;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  homeCountry: string;
  homeCity: string;
  typicalLat: number;
  typicalLng: number;
  avatarUrl?: string;
  created_at: string;
}

export interface FeatureBreakdown {
  geoDistanceKm: number;
  geoDistanceScore: number; // 0 to 1
  newDeviceScore: number;   // 0 or 0.35
  timeDeviationScore: number; // 0 to 0.25 (hour z-score deviation)
  velocityScore: number;    // 0 to 0.40 (logins in short time)
  ipReputationScore: number; // 0 to 0.30 (known VPN/Tor/Proxy)
  rawScore: number;
  finalRiskScore: number;
  contributions: {
    feature: string;
    score: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export interface LoginEvent {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  geoCountry: string;
  geoCity: string;
  geoLat: number;
  geoLng: number;
  deviceFingerprint: string;
  deviceOS: string;
  deviceBrowser: string;
  isNewDevice: boolean;
  eventTime: string;
  riskScore: number; // 0.000 to 1.000
  classification: ClassificationType;
  modelVersion: string;
  features: FeatureBreakdown;
  alertCreated: boolean;
}

export interface Alert {
  id: string;
  loginEventId: string;
  event: LoginEvent;
  status: AlertStatus;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionReason?: string;
  userFeedback: UserFeedbackType;
}

export interface UserBaseline {
  userId: string;
  typicalCountries: string[];
  typicalCities: string[];
  typicalLat: number;
  typicalLng: number;
  typicalHoursHistogram: number[]; // 24 hours distribution
  knownDevices: string[];
  lastLoginTime?: string;
  updatedAt: string;
}

export interface ModelMetric {
  version: string;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  threshold: number; // default 0.40 for suspicious, 0.75 for blocked
  totalEvaluated: number;
  accuracy: number;
  geoDrift: number; // % drift
  deviceDrift: number;
  timeDrift: number;
  trainedAt: string;
  isActive: boolean;
}

export interface RetrainJob {
  id: string;
  versionTag: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  metricsBefore: { recall: number; precision: number; fpr: number };
  metricsAfter?: { recall: number; precision: number; fpr: number };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEventId?: string;
  details: string;
  riskScore?: number;
  ipAddress: string;
}
