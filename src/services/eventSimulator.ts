import type { LoginEvent, UserBaseline, UserProfile } from '../types/security';
import { extractAndClassifyEvent } from './mlEngine';

export type AttackScenarioType = 'impossible_travel' | 'brute_force' | 'tor_proxy' | 'new_device_login' | 'normal_flow';

export function generateSimulatedEvent(
  scenario: AttackScenarioType,
  targetUser: UserProfile,
  baseline: UserBaseline,
  recentEvents: LoginEvent[],
  suspiciousThreshold: number,
  blockedThreshold: number,
  modelVersion: string
): LoginEvent {
  const timestamp = new Date().toISOString();

  let params = {
    userId: targetUser.id,
    userName: targetUser.fullName,
    userEmail: targetUser.email,
    ipAddress: '198.51.100.42',
    geoCountry: targetUser.homeCountry,
    geoCity: targetUser.homeCity,
    geoLat: targetUser.typicalLat,
    geoLng: targetUser.typicalLng,
    deviceFingerprint: baseline.knownDevices[0] || 'fp_default_mac',
    deviceOS: 'macOS 14',
    deviceBrowser: 'Chrome 122.0',
    eventTime: timestamp
  };

  switch (scenario) {
    case 'impossible_travel':
      params.ipAddress = '185.220.101.99';
      params.geoCountry = 'Singapore';
      params.geoCity = 'Singapore';
      params.geoLat = 1.3521;
      params.geoLng = 103.8198;
      params.deviceFingerprint = 'fp_stealth_linux';
      params.deviceOS = 'Linux x86_64';
      params.deviceBrowser = 'Firefox 120.0';
      break;

    case 'brute_force':
      params.ipAddress = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
      params.geoCountry = 'Netherlands';
      params.geoCity = 'Amsterdam';
      params.geoLat = 52.3676;
      params.geoLng = 4.9041;
      params.deviceFingerprint = `fp_botnet_worker_${Math.floor(Math.random() * 1000)}`;
      params.deviceOS = 'Android 11 (Headless)';
      params.deviceBrowser = 'Python-Requests/2.31';
      break;

    case 'tor_proxy':
      params.ipAddress = '185.220.101.44';
      params.geoCountry = 'Anonymous Proxy';
      params.geoCity = 'Unknown Node';
      params.geoLat = 50.1109;
      params.geoLng = 8.6821;
      params.deviceFingerprint = 'fp_tor_browser_v13';
      params.deviceOS = 'Windows 10';
      params.deviceBrowser = 'Tor Browser 13.0';
      break;

    case 'new_device_login':
      params.deviceFingerprint = `fp_new_macbook_${Date.now().toString().slice(-4)}`;
      params.deviceOS = 'macOS 15 Sequoia';
      params.deviceBrowser = 'Safari 18.0';
      break;

    case 'normal_flow':
    default:
      break;
  }

  return extractAndClassifyEvent(
    params,
    baseline,
    recentEvents,
    suspiciousThreshold,
    blockedThreshold,
    modelVersion
  );
}
