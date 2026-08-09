import React, { useState, useEffect, useRef } from 'react';
import { useSecurity } from '../context/SecurityContext';
import type { AttackScenarioType } from '../services/eventSimulator';
import { MOCK_USERS } from '../services/mockData';
import { Zap, X, Globe, ShieldAlert, Play, Pause, Terminal, RefreshCw, MapPin } from 'lucide-react';

const GEOLOCATIONS = [
  { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'United States', ip: '64.233.160.104' },
  { lat: 51.5074, lng: -0.1278, city: 'London', country: 'United Kingdom', ip: '82.165.1.1' },
  { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', ip: '110.50.64.1' },
  { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', ip: '185.220.101.99' },
  { lat: 59.9343, lng: 30.3351, city: 'Saint Petersburg', country: 'Russia', ip: '185.220.101.42' },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', ip: '120.150.8.20' },
  { lat: -23.5505, lng: -46.6333, city: 'Sao Paulo', country: 'Brazil', ip: '177.200.1.10' },
  { lat: 30.0444, lng: 31.2357, city: 'Cairo', country: 'Egypt', ip: '197.30.22.4' }
];

export const EventSimulatorModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    injectSimulatedEvent,
    injectCustomEvent
  } = useSecurity();

  const [selectedUser, setSelectedUser] = useState<string>('usr_alex_02');
  const [isAutoStreamActive, setIsAutoStreamActive] = useState<boolean>(false);
  const [lastInjected, setLastInjected] = useState<string | null>(null);

  // Custom event form states
  const [customIp, setCustomIp] = useState<string>('185.220.101.42');
  const [customCountry, setCustomCountry] = useState<string>('Russia');
  const [customCity, setCustomCity] = useState<string>('Saint Petersburg');
  const [customOs, setCustomOs] = useState<string>('Kali Linux 2024.1');
  const [customLat, setCustomLat] = useState<number>(59.9343);
  const [customLng, setCustomLng] = useState<number>(30.3351);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const selectedMarkerRef = useRef<any>(null);

  // Auto-stream generator effect
  useEffect(() => {
    let interval: any = null;
    if (isAutoStreamActive) {
      interval = setInterval(() => {
        const scenarios: AttackScenarioType[] = [
          'impossible_travel',
          'brute_force',
          'tor_proxy',
          'normal_flow',
          'normal_flow'
        ];
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const randomUser = MOCK_USERS[Math.floor(Math.random() * (MOCK_USERS.length - 1)) + 1];
        const evt = injectSimulatedEvent(randomScenario, randomUser.id);
        setLastInjected(`Auto-ingested ${randomScenario} for ${evt.userName} (Risk: ${evt.riskScore.toFixed(2)})`);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoStreamActive, injectSimulatedEvent]);

  // Leaflet map integration in simulator
  useEffect(() => {
    if (!isSimulatorOpen) return;

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
          initializeSimulatorMap();
        };
        document.body.appendChild(script);
      }
    } else {
      const timer = setTimeout(() => {
        initializeSimulatorMap();
      }, 50);
      return () => clearTimeout(timer);
    }

    function initializeSimulatorMap() {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20, 0], 1.5);
      mapInstanceRef.current = map;

      // Clean light mode tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      // Custom marker icon creation helper
      const createMarkerIcon = (isActive: boolean) => {
        return L.divIcon({
          html: `<div style="background-color: ${isActive ? '#0d1117' : '#9ca3af'}; width: 10px; height: 10px; border: 2px solid white; border-radius: 50%; box-shadow: 0 1.5px 3px rgba(0,0,0,0.25);"></div>`,
          className: 'custom-leaflet-marker',
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });
      };

      // Add preset locations as markers
      GEOLOCATIONS.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], {
          icon: createMarkerIcon(loc.city === customCity)
        }).addTo(map);

        marker.bindPopup(`<b>${loc.city}, ${loc.country}</b><br>Click to select location`);

        marker.on('click', () => {
          setCustomCity(loc.city);
          setCustomCountry(loc.country);
          setCustomIp(loc.ip);
          setCustomLat(loc.lat);
          setCustomLng(loc.lng);

          // Update marker stylings
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.setIcon(createMarkerIcon(false));
          }
          marker.setIcon(createMarkerIcon(true));
          selectedMarkerRef.current = marker;
        });

        if (loc.city === customCity) {
          selectedMarkerRef.current = marker;
        }
      });

      // Allow clicking anywhere on the map to set custom coordinates
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setCustomLat(parseFloat(lat.toFixed(4)));
        setCustomLng(parseFloat(lng.toFixed(4)));
        setCustomCity('Custom Location');
        setCustomCountry('Unknown Region');
        
        // Remove previous custom marker selection highlight
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.setIcon(createMarkerIcon(false));
        }

        // Add a temporary green selection dot at clicked point
        const customSelectionMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div style="background-color: #b45309; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%;"></div>`,
            className: 'custom-leaflet-marker',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })
        }).addTo(map);
        
        selectedMarkerRef.current = customSelectionMarker;
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isSimulatorOpen]);

  if (!isSimulatorOpen) return null;

  const handleTriggerScenario = (scenario: AttackScenarioType) => {
    const evt = injectSimulatedEvent(scenario, selectedUser);
    setLastInjected(`Ingested [${scenario.toUpperCase()}] for ${evt.userName} — Risk Score: ${evt.riskScore.toFixed(2)}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evt = injectCustomEvent({
      userId: selectedUser,
      ipAddress: customIp,
      geoCountry: customCountry,
      geoCity: customCity,
      geoLat: customLat,
      geoLng: customLng,
      deviceOS: customOs,
      deviceBrowser: 'Firefox 115.0 Tor'
    });
    setLastInjected(`Custom event ingested for ${evt.userName} — Risk Score: ${evt.riskScore.toFixed(2)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border border-[#e4e7ec] rounded-xl shadow-xl overflow-hidden text-[#0d1117] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9fb] border-b border-[#e4e7ec]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#fffbeb] border border-[#fde68a] text-[#b45309]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0d1117] flex items-center gap-2">
                Attack &amp; Traffic Simulator
              </h2>
              <p className="text-xs text-[#555f6d] mt-0.5">
                Inject real-time authentication events &amp; security attack vectors to evaluate AI anomaly scoring.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSimulatorOpen(false)}
            className="p-1.5 rounded-lg border border-[#e4e7ec] bg-white text-[#555f6d] hover:bg-[#f8f9fb] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-[#f8f9fb]">
          {/* Target User Selector */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">
              Target Monitored User Account
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOCK_USERS.filter(u => u.role === 'user').map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-0.5 ${
                    selectedUser === u.id
                      ? 'bg-[#f0f2f5] border-[#0d1117] text-[#0d1117] shadow-sm'
                      : 'bg-white border-[#e4e7ec] text-[#555f6d] hover:border-[#c8cdd6]'
                  }`}
                >
                  <span className="font-bold text-xs truncate">{u.fullName}</span>
                  <span className="text-[10px] opacity-75">{u.homeCity}, {u.homeCountry}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Attack Buttons */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">
              One-Click Attack Vectors &amp; Scenarios
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleTriggerScenario('impossible_travel')}
                className="relative p-3 rounded-lg bg-white border border-[#e4e7ec] hover:border-[#c8cdd6] hover:bg-[#f8f9fb] text-left transition-all overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#b91c1c]" />
                <div className="flex items-center justify-between mb-1 pl-2">
                  <span className="font-bold text-xs text-[#0d1117] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#b91c1c]" />
                    Impossible Travel Attack
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]">
                    High Risk
                  </span>
                </div>
                <p className="text-[11px] text-[#555f6d] pl-2">
                  Simulates a login from Singapore 10 minutes after New York login.
                </p>
              </button>

              <button
                onClick={() => handleTriggerScenario('brute_force')}
                className="relative p-3 rounded-lg bg-white border border-[#e4e7ec] hover:border-[#c8cdd6] hover:bg-[#f8f9fb] text-left transition-all overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#b45309]" />
                <div className="flex items-center justify-between mb-1 pl-2">
                  <span className="font-bold text-xs text-[#0d1117] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#b45309]" />
                    Credential Stuffing / Velocity
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#fffbeb] border border-[#fde68a] text-[#b45309]">
                    Critical
                  </span>
                </div>
                <p className="text-[11px] text-[#555f6d] pl-2">
                  High frequency automated login bursts from botnet IP pool.
                </p>
              </button>

              <button
                onClick={() => handleTriggerScenario('tor_proxy')}
                className="relative p-3 rounded-lg bg-white border border-[#e4e7ec] hover:border-[#c8cdd6] hover:bg-[#f8f9fb] text-left transition-all overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-600" />
                <div className="flex items-center justify-between mb-1 pl-2">
                  <span className="font-bold text-xs text-[#0d1117] flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-600" />
                    Tor Exit Node / High-Risk IP
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700">
                    Suspicious
                  </span>
                </div>
                <p className="text-[11px] text-[#555f6d] pl-2">
                  Login originating from an anonymous proxy network node.
                </p>
              </button>

              <button
                onClick={() => handleTriggerScenario('normal_flow')}
                className="relative p-3 rounded-lg bg-white border border-[#e4e7ec] hover:border-[#c8cdd6] hover:bg-[#f8f9fb] text-left transition-all overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#15803d]" />
                <div className="flex items-center justify-between mb-1 pl-2">
                  <span className="font-bold text-xs text-[#0d1117] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#15803d]" />
                    Legitimate User Login
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
                    Normal
                  </span>
                </div>
                <p className="text-[11px] text-[#555f6d] pl-2">
                  Standard baseline login from registered user home location &amp; device.
                </p>
              </button>
            </div>
          </div>

          {/* Auto Stream Control */}
          <div className="p-4 rounded-lg bg-white border border-[#e4e7ec] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 text-[#0d1117] ${isAutoStreamActive ? 'animate-spin' : ''}`} />
              <div>
                <span className="font-bold text-xs text-[#0d1117]">Continuous Traffic Generator</span>
                <p className="text-[11px] text-[#555f6d]">Pushes a randomized event every 3.5 seconds into the live stream</p>
              </div>
            </div>
            <button
              onClick={() => setIsAutoStreamActive(!isAutoStreamActive)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isAutoStreamActive
                  ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                  : 'bg-[#0d1117] text-white hover:bg-[#1c2537]'
              }`}
            >
              {isAutoStreamActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoStreamActive ? 'Stop Stream' : 'Start Live Stream'}</span>
            </button>
          </div>

          {/* Custom Event Builder + Map Selector (Two Column Layout) */}
          <div className="p-4 rounded-lg bg-white border border-[#e4e7ec] shadow-sm space-y-3">
            <span className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider">
              Bespoke Custom Event Generator
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form Inputs (Left side) */}
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[#555f6d] font-semibold">IP Address</label>
                    <input
                      type="text"
                      value={customIp}
                      onChange={e => setCustomIp(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-[#f8f9fb] border border-[#e4e7ec] text-[#0d1117] focus:outline-none focus:border-[#0d1117]"
                    />
                  </div>
                  <div>
                    <label className="text-[#555f6d] font-semibold">Country</label>
                    <input
                      type="text"
                      value={customCountry}
                      onChange={e => setCustomCountry(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-[#f8f9fb] border border-[#e4e7ec] text-[#0d1117] focus:outline-none focus:border-[#0d1117]"
                    />
                  </div>
                  <div>
                    <label className="text-[#555f6d] font-semibold">City</label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={e => setCustomCity(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-[#f8f9fb] border border-[#e4e7ec] text-[#0d1117] focus:outline-none focus:border-[#0d1117]"
                    />
                  </div>
                  <div>
                    <label className="text-[#555f6d] font-semibold">OS / User Agent</label>
                    <input
                      type="text"
                      value={customOs}
                      onChange={e => setCustomOs(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg bg-[#f8f9fb] border border-[#e4e7ec] text-[#0d1117] focus:outline-none focus:border-[#0d1117]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] text-[#555f6d]">
                  <div>
                    <span className="font-semibold">Latitude:</span> {customLat}
                  </div>
                  <div>
                    <span className="font-semibold">Longitude:</span> {customLng}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg border border-[#0d1117] bg-white hover:bg-[#f8f9fb] text-[#0d1117] font-bold text-xs transition-colors shadow-sm"
                >
                  Inject Custom Payload
                </button>
              </form>

              {/* Map Selector (Right side) */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-[#555f6d] flex items-center gap-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
                  Click to select simulated coordinates:
                </span>
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-44 rounded-lg border border-[#e4e7ec] bg-[#f8f9fb] relative z-10 overflow-hidden shadow-inner" 
                />
              </div>
            </div>
          </div>

          {/* Last Injected Status */}
          {lastInjected && (
            <div className="p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-ping" />
              <span>{lastInjected}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
