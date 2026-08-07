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
  ShieldAlert,
  User,
  Menu,
  X,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const {
    role,
    switchRole,
    alerts,
    setIsSimulatorOpen,
    isAudioMuted,
    setIsAudioMuted,
    resetSystemData
  } = useSecurity();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const openAlertsCount = alerts.filter(a => a.status === 'flagged').length;

  const adminNavItems = [
    { id: 'feed',         icon: Activity,  label: 'Live Feed',     badge: openAlertsCount || null },
    { id: 'model-health', icon: Cpu,        label: 'Model Health',  badge: null },
    { id: 'audit',        icon: FileText,   label: 'Audit Trail',   badge: null },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#f1f3f6]">
        <div className="w-8 h-8 rounded-lg bg-[#0d1117] flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-sm font-bold text-[#0d1117] leading-none truncate">CloudGuard Sentinel</h1>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">Enterprise Security</p>
        </div>
      </div>

      {/* Live Status */}
      <div className="px-4 py-3 border-b border-[#f1f3f6]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803d] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803d]" />
          </span>
          <span className="text-[11px] text-[#555f6d] font-medium">Real-Time Stream Active</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {role === 'admin' ? (
          <>
            {adminNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentTab(item.id); setIsMobileOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#f0f2f5] text-[#0d1117] font-semibold'
                      : 'text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#0d1117] font-medium'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0d1117]' : 'text-[#9ca3af]'}`} />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="ml-auto text-[10px] font-bold bg-[#b45309] text-white px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[#f1f3f6]">
              <button
                onClick={() => { setIsSimulatorOpen(true); setIsMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#0d1117] transition-colors duration-150"
              >
                <Zap className="w-4 h-4 text-[#9ca3af] shrink-0" />
                Run Simulation
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => { setCurrentTab('my-activity'); setIsMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
              currentTab === 'my-activity'
                ? 'bg-[#f0f2f5] text-[#0d1117] font-semibold'
                : 'text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#0d1117] font-medium'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0 text-[#9ca3af]" />
            My Activity & Alerts
          </button>
        )}

        {/* Footer nav items */}
        <div className="pt-2 mt-2 border-t border-[#f1f3f6] space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#0d1117] transition-colors">
            <HelpCircle className="w-4 h-4 text-[#9ca3af] shrink-0" />
            Support
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#0d1117] transition-colors">
            <BookOpen className="w-4 h-4 text-[#9ca3af] shrink-0" />
            Documentation
          </button>
        </div>
      </nav>

      {/* Bottom Controls */}
      <div className="border-t border-[#f1f3f6] px-3 py-3 space-y-3">
        {/* Role Switcher */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#9ca3af] px-1 mb-1.5">View As</p>
          <div className="flex gap-1 bg-[#f0f2f5] p-1 rounded-lg">
            <button
              onClick={() => { switchRole('admin'); setCurrentTab('feed'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
                role === 'admin'
                  ? 'bg-white text-[#0d1117] shadow-sm'
                  : 'text-[#555f6d] hover:text-[#0d1117]'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              Admin
            </button>
            <button
              onClick={() => { switchRole('user', 'usr_alex_02'); setCurrentTab('my-activity'); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${
                role === 'user'
                  ? 'bg-white text-[#0d1117] shadow-sm'
                  : 'text-[#555f6d] hover:text-[#0d1117]'
              }`}
            >
              <User className="w-3 h-3" />
              Customer
            </button>
          </div>
        </div>

        {/* Utility Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            title={isAudioMuted ? 'Unmute alerts' : 'Mute alerts'}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#e4e7ec] text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#0d1117] text-xs transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isAudioMuted ? 'Muted' : 'Sound'}</span>
          </button>
          <button
            onClick={resetSystemData}
            title="Reset system data"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#e4e7ec] text-[#555f6d] hover:bg-[#f5f6f8] hover:text-[#b91c1c] text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="w-8 h-8 rounded-full bg-[#e4e7ec] flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-[#555f6d]" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#0d1117] truncate">
              {role === 'admin' ? 'Admin User' : 'Alex Mercer'}
            </p>
            <p className="text-[11px] text-[#9ca3af] truncate">
              {role === 'admin' ? 'admin@sentinel.ai' : 'alex@company.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — fixed left */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#e4e7ec] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e4e7ec] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0d1117] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[#0d1117]">CloudGuard Sentinel</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-[#555f6d] hover:bg-[#f5f6f8] transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute top-14 left-0 bottom-0 w-72 bg-white border-r border-[#e4e7ec] overflow-y-auto animate-fadeIn">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile top padding spacer */}
      <div className="md:hidden h-14 shrink-0" />
    </>
  );
};
