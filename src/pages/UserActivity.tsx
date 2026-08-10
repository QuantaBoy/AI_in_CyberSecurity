import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { RiskBadge } from '../components/RiskBadge';
import { MOCK_USERS } from '../services/mockData';
import {
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Globe,
  Smartphone,
  Clock,
  Shield,
  MapPin,
  HelpCircle
} from 'lucide-react';

export const UserActivity: React.FC = () => {
  const {
    currentUser,
    switchRole,
    events,
    alerts,
    submitUserFeedback,
    baselines
  } = useSecurity();

  // Filter events for current logged-in end user
  const userEvents = events.filter(e => e.userId === currentUser.id);

  // Find open alerts for this user needing "Was this you?" confirmation
  const userAlerts = alerts.filter(
    a => a.event.userId === currentUser.id && (a.status === 'flagged' || a.status === 'open')
  );

  const userBaseline = baselines[currentUser.id];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* End User Account Switcher (For Demo Flexibility) */}
      <div className="p-4 rounded-xl bg-white border border-[#e4e7ec] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f0f2f5] border border-[#e4e7ec] flex items-center justify-center font-bold text-[#0d1117]">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0d1117] flex items-center gap-2">
              {currentUser.fullName}
            </h2>
            <p className="text-xs text-[#555f6d]">{currentUser.email} • Monitored Account</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#555f6d]">Switch Customer View:</span>
          <div className="flex items-center gap-1 bg-[#f0f2f5] p-1 rounded-lg border border-[#e4e7ec]">
            {MOCK_USERS.filter(u => u.role === 'user').map(u => (
              <button
                key={u.id}
                onClick={() => switchRole('user', u.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  currentUser.id === u.id
                    ? 'bg-white text-[#0d1117] shadow-sm'
                    : 'text-[#555f6d] hover:text-[#0d1117]'
                }`}
              >
                {u.fullName.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Security Baseline Card */}
      {userBaseline && (
        <div className="p-5 rounded-xl bg-white border border-[#e4e7ec] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#f0f2f5] border border-[#e4e7ec] text-[#0d1117]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#555f6d] font-semibold block">Registered Primary Region</span>
              <span className="font-bold text-[#0d1117] text-sm">
                {userBaseline.typicalCities.join(', ')} ({userBaseline.typicalCountries.join(', ')})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#f0f2f5] border border-[#e4e7ec] text-[#0d1117]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#555f6d] font-semibold block">Recognized Devices</span>
              <span className="font-bold text-[#0d1117] text-sm">
                {userBaseline.knownDevices.length} Trusted Devices
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#555f6d] font-semibold block">AI Behavioral Baseline</span>
              <span className="font-bold text-[#15803d] text-sm">
                Active & Learning
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive "Was This You?" Alert Banners */}
      {userAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#b45309] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Security Notice — Action Required
          </h3>

          {userAlerts.map(alt => (
            <div
              key={alt.id}
              className="relative p-5 rounded-xl bg-white border border-[#fde68a] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
            >
              {/* Left Orange strip */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#b45309]" />

              <div className="flex items-start gap-3 pl-2">
                <div className="p-3 rounded-lg bg-[#fffbeb] border border-[#fde68a] text-[#b45309]">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#0d1117]">
                      Unusual Login Detected from {alt.event.geoCity}, {alt.event.geoCountry}
                    </span>
                    <RiskBadge score={alt.event.riskScore} classification={alt.event.classification} size="sm" showBar={false} />
                  </div>
                  <p className="text-xs text-[#555f6d] mt-1">
                    An access attempt was recorded using <span className="font-semibold text-[#0d1117]">{alt.event.deviceOS} ({alt.event.deviceBrowser})</span> from IP <span className="font-mono text-[#0d1117] font-semibold">{alt.event.ipAddress}</span> at {new Date(alt.event.eventTime).toLocaleString()}.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-end md:self-center">
                <button
                  onClick={() => submitUserFeedback(alt.loginEventId, 'confirmed_legitimate')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] font-bold text-xs shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, This Was Me</span>
                </button>

                <button
                  onClick={() => submitUserFeedback(alt.loginEventId, 'reported_intrusion')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] font-bold text-xs shadow-sm transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>No, Secure Account</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Login Activity Timeline */}
      <div className="p-6 rounded-xl bg-white border border-[#e4e7ec] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#0d1117] flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#555f6d]" />
          Recent Account Activity Timeline
        </h3>

        <div className="space-y-3">
          {userEvents.length === 0 ? (
            <p className="text-xs text-[#9ca3af] text-center py-6">
              No recent login events recorded for this user.
            </p>
          ) : (
            userEvents.map(evt => (
              <div
                key={evt.id}
                className="p-4 rounded-lg bg-white border border-[#e4e7ec] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-[#c8cdd6]"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#f0f2f5] text-[#0d1117] border border-[#e4e7ec]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0d1117] text-xs flex items-center gap-2">
                      <span>{evt.geoCity}, {evt.geoCountry}</span>
                      {evt.isNewDevice && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#fffbeb] border border-[#fde68a] text-[#b45309] uppercase tracking-wider">
                          New Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#555f6d] font-mono mt-0.5">
                      {evt.deviceOS} • {evt.deviceBrowser} • IP: {evt.ipAddress}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right text-[11px] text-[#9ca3af] font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9ca3af]" />
                      <span>{new Date(evt.eventTime).toLocaleString()}</span>
                    </div>
                  </div>

                  <RiskBadge score={evt.riskScore} classification={evt.classification} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
