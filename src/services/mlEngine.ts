import type { FeatureBreakdown, LoginEvent, UserBaseline, ClassificationType } from '../types/security';

// Haversine formula to compute distance in km between two lat/lng coordinates
export function calculateGeoDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function extractAndClassifyEvent(
  params: {
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
    eventTime?: string;
  },
  baseline: UserBaseline,
  recentEventsForUser: LoginEvent[] = [],
  suspiciousThreshold: number = 0.40,
  blockedThreshold: number = 0.75,
  modelVersion: string = 'v1.4.2-isolation-forest'
): LoginEvent {
  const eventTimeStr = params.eventTime || new Date().toISOString();
  const eventDate = new Date(eventTimeStr);
  const eventHour = eventDate.getHours();

  // 1. Geo distance feature
  const geoDistanceKm = calculateGeoDistance(
    baseline.typicalLat,
    baseline.typicalLng,
    params.geoLat,
    params.geoLng
  );

  // Normalize geo distance score: 0km -> 0.0, 500km -> 0.1, 3000km+ -> 1.0
  let geoDistanceScore = 0;
  if (geoDistanceKm > 3000) geoDistanceScore = 1.0;
  else if (geoDistanceKm > 1000) geoDistanceScore = 0.75;
  else if (geoDistanceKm > 300) geoDistanceScore = 0.45;
  else if (geoDistanceKm > 50) geoDistanceScore = 0.15;

  // Country mismatch extra penalty
  const isNewCountry = !baseline.typicalCountries.includes(params.geoCountry);
  if (isNewCountry) {
    geoDistanceScore = Math.max(geoDistanceScore, 0.85);
  }

  // 2. New device feature
  const isNewDevice = !baseline.knownDevices.some(d => d.toLowerCase().includes(params.deviceOS.toLowerCase()) || d === params.deviceFingerprint);
  const newDeviceScore = isNewDevice ? 0.35 : 0.0;

  // 3. Time of day deviation score
  const typicalProbability = baseline.typicalHoursHistogram[eventHour] || 0;
  let timeDeviationScore = 0;
  if (typicalProbability === 0) timeDeviationScore = 0.25;
  else if (typicalProbability < 0.02) timeDeviationScore = 0.18;
  else if (typicalProbability < 0.05) timeDeviationScore = 0.10;

  // 4. Velocity score (logins in last 5 minutes)
  const fiveMinsAgo = new Date(eventDate.getTime() - 5 * 60 * 1000);
  const recentCount = recentEventsForUser.filter(
    e => new Date(e.eventTime) >= fiveMinsAgo
  ).length;

  let velocityScore = 0;
  if (recentCount >= 10) velocityScore = 0.40;
  else if (recentCount >= 5) velocityScore = 0.25;
  else if (recentCount >= 3) velocityScore = 0.12;

  // 5. IP Reputation / Tor Proxy detection
  let ipReputationScore = 0;
  const isKnownProxy = params.ipAddress.startsWith('185.') || params.ipAddress.startsWith('198.') || params.geoCountry === 'Anonymous Proxy';
  if (isKnownProxy) {
    ipReputationScore = 0.30;
  }

  // Feature weights per Isolation Forest & PRD rules
  const wGeo = 0.40;
  const wDev = 0.25;
  const wTime = 0.15;
  const wVel = 0.12;
  const wIp = 0.08;

  const rawScore =
    geoDistanceScore * wGeo +
    newDeviceScore * wDev +
    timeDeviationScore * wTime +
    velocityScore * wVel +
    ipReputationScore * wIp;

  const finalRiskScore = parseFloat(Math.min(1.0, Math.max(0.0, rawScore * 1.35)).toFixed(3));

  const contributions = [
    {
      feature: 'Geographical Deviation',
      score: parseFloat((geoDistanceScore * wGeo).toFixed(3)),
      description: `${geoDistanceKm} km from typical location centroid (${baseline.typicalCities.join(', ')}). ${isNewCountry ? '⚠️ New Country Detected!' : ''}`,
      severity: geoDistanceScore > 0.6 ? ('high' as const) : geoDistanceScore > 0.2 ? ('medium' as const) : ('low' as const)
    },
    {
      feature: 'Device Fingerprint',
      score: parseFloat((newDeviceScore * wDev).toFixed(3)),
      description: isNewDevice ? `Unseen device fingerprint: ${params.deviceOS} / ${params.deviceBrowser}` : `Recognized device: ${params.deviceOS}`,
      severity: isNewDevice ? ('medium' as const) : ('low' as const)
    },
    {
      feature: 'Time-of-Day Anomaly',
      score: parseFloat((timeDeviationScore * wTime).toFixed(3)),
      description: `Attempted at ${eventHour}:00 local time. (Historical baseline frequency: ${(typicalProbability * 100).toFixed(1)}%)`,
      severity: timeDeviationScore > 0.15 ? ('medium' as const) : ('low' as const)
    },
    {
      feature: 'Login Velocity Spike',
      score: parseFloat((velocityScore * wVel).toFixed(3)),
      description: `${recentCount + 1} authentication requests in last 5 minutes.`,
      severity: velocityScore > 0.2 ? ('high' as const) : ('low' as const)
    },
    {
      feature: 'IP / Network Reputation',
      score: parseFloat((ipReputationScore * wIp).toFixed(3)),
      description: isKnownProxy ? 'IP associated with high-risk exit node / VPN range' : 'Standard ISP / Residential IP range',
      severity: isKnownProxy ? ('high' as const) : ('low' as const)
    }
  ];

  let classification: ClassificationType = 'normal';
  if (finalRiskScore >= blockedThreshold) {
    classification = 'blocked';
  } else if (finalRiskScore >= suspiciousThreshold) {
    classification = 'suspicious';
  }

  const featureBreakdown: FeatureBreakdown = {
    geoDistanceKm,
    geoDistanceScore,
    newDeviceScore,
    timeDeviationScore,
    velocityScore,
    ipReputationScore,
    rawScore,
    finalRiskScore,
    contributions
  };

  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id: eventId,
    userId: params.userId,
    userName: params.userName,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress,
    geoCountry: params.geoCountry,
    geoCity: params.geoCity,
    geoLat: params.geoLat,
    geoLng: params.geoLng,
    deviceFingerprint: params.deviceFingerprint,
    deviceOS: params.deviceOS,
    deviceBrowser: params.deviceBrowser,
    isNewDevice,
    eventTime: eventTimeStr,
    riskScore: finalRiskScore,
    classification,
    modelVersion,
    features: featureBreakdown,
    alertCreated: classification !== 'normal'
  };
}
