import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  UserRole,
  LoginEvent,
  Alert,
  ModelMetric,
  AuditLogEntry,
  UserBaseline
} from '../types/security';
import { MOCK_USERS, MOCK_BASELINES } from '../services/mockData';
import { StorageService } from '../services/storage';
import { extractAndClassifyEvent } from '../services/mlEngine';
import { generateSimulatedEvent, type AttackScenarioType } from '../services/eventSimulator';
import { ToastContainer, type ToastMessage } from '../components/ToastContainer';

interface SecurityContextType {
  currentUser: UserProfile;
  role: UserRole;
  events: LoginEvent[];
  alerts: Alert[];
  modelMetric: ModelMetric;
  auditLogs: AuditLogEntry[];
  baselines: Record<string, UserBaseline>;
  selectedEvent: LoginEvent | null;
  isSimulatorOpen: boolean;
  isAudioMuted: boolean;
  activeFilter: 'all' | 'critical' | 'suspicious' | 'normal';
  isLoading: boolean;
  
  switchRole: (role: UserRole, userId?: string) => void;
  setSelectedEvent: (event: LoginEvent | null) => void;
  setIsSimulatorOpen: (open: boolean) => void;
  setIsAudioMuted: (muted: boolean) => void;
  setActiveFilter: (filter: 'all' | 'critical' | 'suspicious' | 'normal') => void;
  
  blockSession: (eventId: string, reason?: string) => void;
  approveLogin: (eventId: string, reason?: string) => void;
  submitUserFeedback: (eventId: string, feedback: 'confirmed_legitimate' | 'reported_intrusion') => void;
  updateThreshold: (newThreshold: number) => void;
  triggerRetrainJob: () => Promise<void>;
  injectSimulatedEvent: (scenario: AttackScenarioType, targetUserId?: string) => LoginEvent;
  injectCustomEvent: (params: {
    userId: string;
    ipAddress: string;
    geoCountry: string;
    geoCity: string;
    geoLat: number;
    geoLng: number;
    deviceOS: string;
    deviceBrowser: string;
  }) => LoginEvent;
  resetSystemData: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [role, setRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [events, setEvents] = useState<LoginEvent[]>(() => StorageService.getEvents());
  const [alerts, setAlerts] = useState<Alert[]>(() => StorageService.getAlerts());
  const [modelMetric, setModelMetric] = useState<ModelMetric>(() => StorageService.getModelMetric());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => StorageService.getAuditLogs());
  const [baselines, setBaselines] = useState<Record<string, UserBaseline>>(() => StorageService.getBaselines());
  
  const [selectedEvent, setSelectedEvent] = useState<LoginEvent | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'suspicious' | 'normal'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    StorageService.saveEvents(events);
  }, [events]);

  useEffect(() => {
    StorageService.saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    StorageService.saveModelMetric(modelMetric);
  }, [modelMetric]);

  useEffect(() => {
    StorageService.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    StorageService.saveBaselines(baselines);
  }, [baselines]);

  const switchRole = (newRole: UserRole, userId?: string) => {
    setIsLoading(true);
    setRole(newRole);
    if (newRole === 'admin') {
      setCurrentUser(MOCK_USERS[0]);
      addToast({ type: 'info', title: 'Switched to Admin Role', description: 'Accessing Security Operations Center (SOC) dashboard' });
    } else {
      const user = MOCK_USERS.find(u => u.id === (userId || 'usr_alex_02')) || MOCK_USERS[1];
      setCurrentUser(user);
      addToast({ type: 'info', title: `Switched to Customer View`, description: `Viewing account activity for ${user.fullName}` });
    }
    setTimeout(() => setIsLoading(false), 250);
  };

  const handleFilterChange = (filter: 'all' | 'critical' | 'suspicious' | 'normal') => {
    setIsLoading(true);
    setActiveFilter(filter);
    setTimeout(() => setIsLoading(false), 200);
  };

  const playAlertSound = (type: 'suspicious' | 'blocked') => {
    if (isAudioMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type === 'blocked' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'blocked' ? 880 : 440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Ignore audio restriction
    }
  };

  const addAuditEntry = (action: string, targetEventId: string | undefined, details: string, riskScore?: number, ipAddress: string = '127.0.0.1') => {
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: role,
      action,
      targetEventId,
      details,
      riskScore,
      ipAddress
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const blockSession = (eventId: string, reason: string = 'Admin manually blocked session due to anomaly score') => {
    const targetEvent = events.find(e => e.id === eventId);

    setEvents(prev =>
      prev.map(evt => (evt.id === eventId ? { ...evt, classification: 'blocked' } : evt))
    );

    setAlerts(prev =>
      prev.map(alt =>
        alt.loginEventId === eventId
          ? {
              ...alt,
              status: 'blocked',
              resolvedBy: currentUser.id,
              resolvedAt: new Date().toISOString(),
              resolutionReason: reason
            }
          : alt
      )
    );

    addAuditEntry('MANUAL_SESSION_BLOCK', eventId, `Admin blocked session for user ${targetEvent?.userName || eventId}: ${reason}`, targetEvent?.riskScore, targetEvent?.ipAddress);
    addToast({ type: 'error', title: 'Session Blocked', description: `Invalidated session for ${targetEvent?.userName || 'user'} and updated audit ledger` });
  };

  const approveLogin = (eventId: string, reason: string = 'Admin verified legitimate user activity') => {
    const targetEvent = events.find(e => e.id === eventId);

    setEvents(prev =>
      prev.map(evt => (evt.id === eventId ? { ...evt, classification: 'normal', alertCreated: false } : evt))
    );

    setAlerts(prev =>
      prev.map(alt =>
        alt.loginEventId === eventId
          ? {
              ...alt,
              status: 'approved',
              resolvedBy: currentUser.id,
              resolvedAt: new Date().toISOString(),
              resolutionReason: reason
            }
          : alt
      )
    );

    if (targetEvent) {
      setBaselines(prev => {
        const userBaseline = prev[targetEvent.userId];
        if (!userBaseline) return prev;
        const updatedDevices = Array.from(new Set([...userBaseline.knownDevices, targetEvent.deviceFingerprint]));
        const updatedCountries = Array.from(new Set([...userBaseline.typicalCountries, targetEvent.geoCountry]));
        const updatedCities = Array.from(new Set([...userBaseline.typicalCities, targetEvent.geoCity]));
        return {
          ...prev,
          [targetEvent.userId]: {
            ...userBaseline,
            knownDevices: updatedDevices,
            typicalCountries: updatedCountries,
            typicalCities: updatedCities,
            updatedAt: new Date().toISOString()
          }
        };
      });
    }

    addAuditEntry('MANUAL_SESSION_APPROVE', eventId, `Admin approved session and updated baseline for ${targetEvent?.userName || eventId}: ${reason}`, targetEvent?.riskScore, targetEvent?.ipAddress);
    addToast({ type: 'success', title: 'Login Approved', description: `Relabeled event as legitimate and added device to user baseline` });
  };

  const submitUserFeedback = (eventId: string, feedback: 'confirmed_legitimate' | 'reported_intrusion') => {
    setAlerts(prev =>
      prev.map(alt =>
        alt.loginEventId === eventId
          ? {
              ...alt,
              userFeedback: feedback,
              status: feedback === 'confirmed_legitimate' ? 'approved' : 'blocked',
              resolvedAt: new Date().toISOString(),
              resolutionReason: feedback === 'confirmed_legitimate' ? 'End user confirmed: "Yes, this was me"' : 'End user reported intrusion: "No, secure my account!"'
            }
          : alt
      )
    );

    if (feedback === 'confirmed_legitimate') {
      approveLogin(eventId, 'End user confirmed activity in My Activity portal');
    } else {
      blockSession(eventId, 'End user reported suspicious login from My Activity portal');
    }
  };

  const updateThreshold = (newThreshold: number) => {
    const baseRecall = 0.885;
    const delta = (0.40 - newThreshold);
    const updatedRecall = Math.min(0.99, Math.max(0.60, parseFloat((baseRecall + delta * 0.45).toFixed(3))));
    const updatedFPR = Math.min(0.35, Math.max(0.02, parseFloat((0.082 - delta * 0.35).toFixed(3))));
    const updatedPrecision = Math.min(0.98, Math.max(0.70, parseFloat((0.912 - delta * 0.25).toFixed(3))));

    setModelMetric(prev => ({
      ...prev,
      threshold: newThreshold,
      recall: updatedRecall,
      precision: updatedPrecision,
      falsePositiveRate: updatedFPR,
      f1Score: parseFloat(((2 * updatedPrecision * updatedRecall) / (updatedPrecision + updatedRecall)).toFixed(3))
    }));

    addAuditEntry('MODEL_THRESHOLD_UPDATED', undefined, `Anomaly threshold tuned from ${modelMetric.threshold} to ${newThreshold}`);
  };

  const triggerRetrainJob = async () => {
    const currentVerNumber = parseFloat(modelMetric.version.replace('v', '').split('-')[0]) || 1.4;
    const nextVerTag = `v${(currentVerNumber + 0.1).toFixed(1)}.0-isolation-forest`;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setModelMetric(prev => ({
          ...prev,
          version: nextVerTag,
          precision: Math.min(0.965, parseFloat((prev.precision + 0.018).toFixed(3))),
          recall: Math.min(0.945, parseFloat((prev.recall + 0.022).toFixed(3))),
          falsePositiveRate: Math.max(0.035, parseFloat((prev.falsePositiveRate - 0.012).toFixed(3))),
          f1Score: Math.min(0.955, parseFloat((prev.f1Score + 0.020).toFixed(3))),
          geoDrift: 0.8,
          deviceDrift: 1.1,
          timeDrift: 0.5,
          trainedAt: new Date().toISOString()
        }));

        addAuditEntry('MODEL_RETRAINED', undefined, `Model pipeline retrained and promoted to ${nextVerTag} with updated labeled incident data.`);
        addToast({ type: 'success', title: 'Model Promoted', description: `Retrained and promoted ${nextVerTag} to active production` });
        resolve();
      }, 2500);
    });
  };

  const injectSimulatedEvent = (scenario: AttackScenarioType, targetUserId?: string): LoginEvent => {
    const targetUser = MOCK_USERS.find(u => u.id === (targetUserId || 'usr_alex_02')) || MOCK_USERS[1];
    const userBaseline = baselines[targetUser.id] || MOCK_BASELINES['usr_alex_02'];

    const newEvt = generateSimulatedEvent(
      scenario,
      targetUser,
      userBaseline,
      events.filter(e => e.userId === targetUser.id),
      modelMetric.threshold,
      0.75,
      modelMetric.version
    );

    setEvents(prev => [newEvt, ...prev]);

    if (newEvt.alertCreated) {
      const newAlert: Alert = {
        id: `alt_${newEvt.id.replace('evt_', '')}`,
        loginEventId: newEvt.id,
        event: newEvt,
        status: newEvt.classification === 'blocked' ? 'blocked' : 'flagged',
        createdAt: newEvt.eventTime,
        userFeedback: null
      };
      setAlerts(prev => [newAlert, ...prev]);
      playAlertSound(newEvt.classification === 'blocked' ? 'blocked' : 'suspicious');

      addToast({
        type: newEvt.classification === 'blocked' ? 'error' : 'warning',
        title: `${newEvt.classification === 'blocked' ? 'Critical Intrusion Blocked' : 'Suspicious Anomaly Flagged'}`,
        description: `${newEvt.userName} from ${newEvt.geoCity}, ${newEvt.geoCountry} (Risk: ${newEvt.riskScore})`
      });
    } else {
      addToast({
        type: 'info',
        title: 'Legitimate Login Verified',
        description: `Normal access from ${newEvt.geoCity}, ${newEvt.geoCountry} (Risk: ${newEvt.riskScore})`
      });
    }

    addAuditEntry(
      'EVENT_INGESTED',
      newEvt.id,
      `Simulated ${scenario} event ingested for ${newEvt.userName} (${newEvt.geoCity}, ${newEvt.geoCountry}). Risk score: ${newEvt.riskScore} [${newEvt.classification.toUpperCase()}]`,
      newEvt.riskScore,
      newEvt.ipAddress
    );

    return newEvt;
  };

  const injectCustomEvent = (params: {
    userId: string;
    ipAddress: string;
    geoCountry: string;
    geoCity: string;
    geoLat: number;
    geoLng: number;
    deviceOS: string;
    deviceBrowser: string;
  }): LoginEvent => {
    const targetUser = MOCK_USERS.find(u => u.id === params.userId) || MOCK_USERS[1];
    const userBaseline = baselines[targetUser.id] || MOCK_BASELINES['usr_alex_02'];

    const newEvt = extractAndClassifyEvent(
      {
        userId: targetUser.id,
        userName: targetUser.fullName,
        userEmail: targetUser.email,
        ipAddress: params.ipAddress,
        geoCountry: params.geoCountry,
        geoCity: params.geoCity,
        geoLat: params.geoLat,
        geoLng: params.geoLng,
        deviceFingerprint: `fp_custom_${Date.now()}`,
        deviceOS: params.deviceOS,
        deviceBrowser: params.deviceBrowser
      },
      userBaseline,
      events.filter(e => e.userId === targetUser.id),
      modelMetric.threshold,
      0.75,
      modelMetric.version
    );

    setEvents(prev => [newEvt, ...prev]);

    if (newEvt.alertCreated) {
      const newAlert: Alert = {
        id: `alt_${newEvt.id.replace('evt_', '')}`,
        loginEventId: newEvt.id,
        event: newEvt,
        status: newEvt.classification === 'blocked' ? 'blocked' : 'flagged',
        createdAt: newEvt.eventTime,
        userFeedback: null
      };
      setAlerts(prev => [newAlert, ...prev]);
      playAlertSound(newEvt.classification === 'blocked' ? 'blocked' : 'suspicious');

      addToast({
        type: 'warning',
        title: 'Custom Event Ingested',
        description: `Risk score ${newEvt.riskScore} assigned [${newEvt.classification.toUpperCase()}]`
      });
    }

    addAuditEntry(
      'CUSTOM_EVENT_INGESTED',
      newEvt.id,
      `Custom login event ingested for ${newEvt.userName}. Risk Score: ${newEvt.riskScore}`,
      newEvt.riskScore,
      newEvt.ipAddress
    );

    return newEvt;
  };

  const resetSystemData = () => {
    StorageService.resetAllData();
    addToast({ type: 'info', title: 'System Reset', description: 'Reset all events, baselines, and audit logs to initial seed state' });
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <SecurityContext.Provider
      value={{
        currentUser,
        role,
        events,
        alerts,
        modelMetric,
        auditLogs,
        baselines,
        selectedEvent,
        isSimulatorOpen,
        isAudioMuted,
        activeFilter,
        isLoading,
        switchRole,
        setSelectedEvent,
        setIsSimulatorOpen,
        setIsAudioMuted,
        setActiveFilter: handleFilterChange,
        blockSession,
        approveLogin,
        submitUserFeedback,
        updateThreshold,
        triggerRetrainJob,
        injectSimulatedEvent,
        injectCustomEvent,
        resetSystemData,
        addToast
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
