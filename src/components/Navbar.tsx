import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import {
  Shield,
  Activity,
  Cpu,
  FileText,
  UserCheck,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  User,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const {
    role,
    switchRole,
    alerts,
    setIsSimulatorOpen,
    isAudioMuted,
    setIsAudioMuted,
    resetSystemData
  } = useSecurity();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const openAlertsCount = alerts.filter(a => a.status === 'flagged').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/30 text-slate-100 shadow-xl shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Live Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 transform hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  CloudGuard Sentinel
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  AI SOC v1.4
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Real-Time Stream Active</span>
              </div>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {role === 'admin' ? (
              <>
                <button
                  onClick={() => setCurrentTab('feed')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentTab === 'feed'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Live Feed</span>
                  {openAlertsCount > 0 && (
                    <span className="ml-1 bg-amber-500 text-slate-950 font-extrabold text-xs px-1.5 py-0.2 rounded-full animate-pulse">
                      {openAlertsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setCurrentTab('model-health')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentTab === 'model-health'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Model Health</span>
                </button>

                <button
                  onClick={() => setCurrentTab('audit')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentTab === 'audit'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Audit Trail</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentTab('my-activity')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentTab === 'my-activity'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>My Activity & Alerts</span>
              </button>
            )}
          </nav>

          {/* Controls & Role Toggle */}
          <div className="flex items-center gap-2">
            {/* Attack Simulator Trigger */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all duration-200 transform hover:scale-105 active:scale-95"
              title="Launch Attack & Traffic Simulator"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span className="hidden sm:inline">Simulate Attack</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all duration-150 active:scale-95"
              title={isAudioMuted ? 'Unmute alert sound' : 'Mute alert sound'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Reset Data */}
            <button
              onClick={resetSystemData}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-slate-700 transition-all duration-150 active:scale-95"
              title="Reset System Data to Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  switchRole('admin');
                  setCurrentTab('feed');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === 'admin'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => {
                  switchRole('user', 'usr_alex_02');
                  setCurrentTab('my-activity');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === 'user'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-2 animate-fadeIn">
            {role === 'admin' ? (
              <>
                <button
                  onClick={() => {
                    setCurrentTab('feed');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Live Feed
                  </span>
                  {openAlertsCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full">
                      {openAlertsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('model-health');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Model Health
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('audit');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Audit Trail
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentTab('my-activity');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                My Activity & Alerts
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
