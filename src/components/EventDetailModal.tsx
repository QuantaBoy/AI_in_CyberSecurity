import React, { useEffect, useRef } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { RiskBadge } from './RiskBadge';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Smartphone,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  User,
  ArrowRight
} from 'lucide-react';

export const EventDetailModal: React.FC = () => {
  const {
    selectedEvent,
    setSelectedEvent,
    baselines,
    blockSession,
    approveLogin,
    alerts
  } = useSecurity();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const userBaseline = selectedEvent ? baselines[selectedEvent.userId] : null;
  const linkedAlert = selectedEvent ? alerts.find(a => a.loginEventId === selectedEvent.id) : null;

  useEffect(() => {
    if (!selectedEvent) return;

    // Load Leaflet stylesheet dynamically
    if (!document.getElementById('leaflet-css-link')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-link';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet script dynamically
    const scriptId = 'leaflet-js-script';
    if (!(window as any).L) {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initializeMap();
        };
        document.body.appendChild(script);
      }
    } else {
      // Leaflet is already loaded, init map directly
      // Give small timeout to allow modal animation / container mount
      const timer = setTimeout(() => {
        initializeMap();
      }, 50);
      return () => clearTimeout(timer);
    }

    function initializeMap() {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default event coords (current attempt)
      const currentLat = selectedEvent?.geoLat || 0;
      const currentLng = selectedEvent?.geoLng || 0;

      // Baseline coords
      const baseLat = userBaseline?.typicalLat || currentLat;
      const baseLng = userBaseline?.typicalLng || currentLng;

      // Compute bounds
      const bounds = L.latLngBounds([
        [currentLat, currentLng],
        [baseLat, baseLng]
      ]);

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;

      // Tile layer (Clean Light Voyager theme to match white dashboard)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon creation helper
      const createMarkerIcon = (color: string) => {
        return L.divIcon({
          html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: 'custom-leaflet-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
      };

      // Add markers
      const currentMarker = L.marker([currentLat, currentLng], {
        icon: createMarkerIcon(selectedEvent?.classification === 'blocked' ? '#b91c1c' : selectedEvent?.classification === 'suspicious' ? '#b45309' : '#15803d')
      }).addTo(map);
      currentMarker.bindPopup(`<b>Current Attempt</b><br>${selectedEvent?.geoCity}, ${selectedEvent?.geoCountry}`);

      // If typical coordinates are different, add baseline marker and polyline
      if (baseLat !== currentLat || baseLng !== currentLng) {
        const baseMarker = L.marker([baseLat, baseLng], {
          icon: createMarkerIcon('#555f6d')
        }).addTo(map);
        baseMarker.bindPopup(`<b>Typical Location</b><br>${userBaseline?.typicalCities[0] || 'Home Region'}`);

        // Add dotted connecting line (Impossible Travel)
        L.polyline([[baseLat, baseLng], [currentLat, currentLng]], {
          color: '#b45309',
          weight: 2,
          dashArray: '5, 8'
        }).addTo(map);

        map.fitBounds(bounds, { padding: [30, 30] });
      } else {
        map.setView([currentLat, currentLng], 6);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedEvent, userBaseline]);

  if (!selectedEvent) return null;

  const handleBlock = () => {
    blockSession(selectedEvent.id, 'Admin manual block from XAI Detail Drawer');
    setSelectedEvent(null);
  };

  const handleApprove = () => {
    approveLogin(selectedEvent.id, 'Admin approved login and updated baseline');
    setSelectedEvent(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-[#e4e7ec] rounded-xl shadow-xl overflow-hidden text-[#0d1117] max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9fb] border-b border-[#e4e7ec]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#f0f2f5] border border-[#e4e7ec] text-[#0d1117]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0d1117] flex items-center gap-2">
                Event Analysis — Explainable AI (XAI)
              </h2>
              <p className="text-[11px] text-[#555f6d] font-mono mt-0.5">
                Event ID: {selectedEvent.id} • Model {selectedEvent.modelVersion}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEvent(null)}
            className="p-1.5 rounded-lg border border-[#e4e7ec] bg-white text-[#555f6d] hover:bg-[#f8f9fb] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-[#f8f9fb]">
          {/* Top Banner: User Info + Risk Badge */}
          <div className="p-4 rounded-xl bg-white border border-[#e4e7ec] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#f0f2f5] border border-[#e4e7ec] flex items-center justify-center font-bold text-[#0d1117] text-base shrink-0">
                {selectedEvent.userName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0d1117]">{selectedEvent.userName}</h3>
                <p className="text-xs text-[#555f6d]">{selectedEvent.userEmail}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#9ca3af] font-mono">
                  <span>IP: {selectedEvent.ipAddress}</span>
                  <span>•</span>
                  <span>{new Date(selectedEvent.eventTime).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
              <span className="text-[9px] uppercase font-extrabold text-[#9ca3af] tracking-wider">
                Risk Classification
              </span>
              <RiskBadge
                score={selectedEvent.riskScore}
                classification={selectedEvent.classification}
                size="md"
              />
            </div>
          </div>

          {/* User Feedback Alert Banner (If available) */}
          {linkedAlert?.userFeedback && (
            <div
              className={`relative p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold overflow-hidden ${
                linkedAlert.userFeedback === 'confirmed_legitimate'
                  ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
                  : 'bg-[#fef2f2] border-[#fecaca] text-[#b91c1c]'
              }`}
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                linkedAlert.userFeedback === 'confirmed_legitimate' ? 'bg-[#15803d]' : 'bg-[#b91c1c]'
              }`} />
              <User className="w-4 h-4 pl-1 shrink-0" />
              <span>
                End-User Response:{' '}
                {linkedAlert.userFeedback === 'confirmed_legitimate'
                  ? 'Confirmed: "Yes, this was me logging in"'
                  : 'Reported Intrusion: "No, this was NOT me!"'}
              </span>
            </div>
          )}

          {/* Interactive Map Visualizer */}
          <div className="rounded-xl border border-[#e4e7ec] bg-white overflow-hidden shadow-sm p-4 space-y-2">
            <span className="text-[10px] font-extrabold text-[#555f6d] uppercase tracking-wider block">
              Authentication Geolocation Map
            </span>
            <div 
              ref={mapContainerRef} 
              className="w-full h-44 rounded-lg bg-[#f0f2f5] border border-[#e4e7ec] relative z-10" 
            />
          </div>

          {/* XAI Explainability Section */}
          <div>
            <h4 className="text-[10px] font-extrabold text-[#555f6d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#9ca3af]" />
              Why Was This Event Flagged? (Feature Attribution)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedEvent.features.contributions.map((c, i) => {
                const isHigh = c.severity === 'high';
                const isMed = c.severity === 'medium';

                const cardStyle = isHigh
                  ? 'bg-white border-[#fecaca] border-l-4 border-l-[#b91c1c]'
                  : isMed
                  ? 'bg-white border-[#fde68a] border-l-4 border-l-[#b45309]'
                  : 'bg-white border-[#e4e7ec] border-l-4 border-l-[#15803d]';

                const badgeStyle = isHigh
                  ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]'
                  : isMed
                  ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]'
                  : 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]';

                return (
                  <div key={i} className={`p-3.5 rounded-lg border shadow-sm ${cardStyle}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-[#0d1117]">
                        {isHigh || isMed ? (
                          <AlertTriangle className={`w-3.5 h-3.5 ${isHigh ? 'text-[#b91c1c]' : 'text-[#b45309]'}`} />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
                        )}
                        {c.feature}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeStyle}`}>
                        +{(c.score).toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-[#555f6d] leading-relaxed">{c.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Baseline Comparison */}
          {userBaseline && (
            <div>
              <h4 className="text-[10px] font-extrabold text-[#555f6d] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#9ca3af]" />
                Historical User Baseline vs Event Context
              </h4>

              <div className="p-4 rounded-xl bg-white border border-[#e4e7ec] space-y-3 text-xs shadow-sm">
                {/* Location comparison */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fb] border border-[#f1f3f6]">
                  <div className="flex items-center gap-2 text-[#555f6d]">
                    <Globe className="w-4 h-4 text-[#9ca3af]" />
                    <span>Typical Locations</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#9ca3af]">{userBaseline.typicalCities.join(', ')} ({userBaseline.typicalCountries.join(', ')})</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c8cdd6]" />
                    <span className={`font-semibold ${selectedEvent.riskScore > 0.4 ? 'text-[#b45309]' : 'text-[#0d1117]'}`}>
                      {selectedEvent.geoCity}, {selectedEvent.geoCountry}
                    </span>
                  </div>
                </div>

                {/* Device comparison */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fb] border border-[#f1f3f6]">
                  <div className="flex items-center gap-2 text-[#555f6d]">
                    <Smartphone className="w-4 h-4 text-[#9ca3af]" />
                    <span>Device Fingerprint</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#9ca3af]">
                      {userBaseline.knownDevices[0]?.split(' ')[0] || 'Known Device'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c8cdd6]" />
                    <span className={`font-semibold ${selectedEvent.isNewDevice ? 'text-[#b45309]' : 'text-[#15803d]'}`}>
                      {selectedEvent.deviceOS} / {selectedEvent.deviceBrowser} {selectedEvent.isNewDevice ? '(NEW)' : '(VERIFIED)'}
                    </span>
                  </div>
                </div>

                {/* Timestamp comparison */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fb] border border-[#f1f3f6]">
                  <div className="flex items-center gap-2 text-[#555f6d]">
                    <Clock className="w-4 h-4 text-[#9ca3af]" />
                    <span>Attempt Timestamp</span>
                  </div>
                  <span className="font-mono text-[#0d1117] font-semibold">
                    {new Date(selectedEvent.eventTime).toLocaleTimeString()} local time
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-[#f8f9fb] border-t border-[#e4e7ec] flex items-center justify-between">
          <button
            onClick={() => setSelectedEvent(null)}
            className="px-4 py-2 rounded-lg border border-[#e4e7ec] bg-white hover:bg-[#f8f9fb] text-[#555f6d] text-xs font-bold transition-colors shadow-sm"
          >
            Close Detail
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve &amp; Learn</span>
            </button>

            <button
              onClick={handleBlock}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-xs transition-all shadow-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Block Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
