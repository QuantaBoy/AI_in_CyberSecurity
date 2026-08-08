import React, { useState } from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { Sidebar } from './components/Sidebar';
import { AdminFeed } from './pages/AdminFeed';
import { UserActivity } from './pages/UserActivity';
import { ModelHealth } from './pages/ModelHealth';
import { AuditTrail } from './pages/AuditTrail';
import { EventSimulatorModal } from './components/EventSimulatorModal';
import { EventDetailModal } from './components/EventDetailModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const { role } = useSecurity();

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#1a1c1c] flex font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 min-h-screen">
        <main className="flex-1 p-4 md:p-8 max-w-[1280px] w-full mx-auto">
          {role === 'admin' ? (
            <>
              {currentTab === 'feed' && <AdminFeed />}
              {currentTab === 'model-health' && <ModelHealth />}
              {currentTab === 'audit' && <AuditTrail />}
            </>
          ) : (
            <UserActivity />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#f1f3f6] bg-white py-4 px-8">
          <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#555f6d]">
              <span className="font-semibold text-[#1a1c1c]">PS2 — AI-Based Cloud Security Monitoring System</span>
              <span className="text-[#c8cdd6]">•</span>
              <span>FastAPI + Supabase + Isolation Forest</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] inline-block" />
                RLS Enforced
              </span>
              <span>Latency P95 &lt; 280ms</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <EventSimulatorModal />
      <EventDetailModal />
    </div>
  );
};

export function App() {
  return (
    <SecurityProvider>
      <AppContent />
    </SecurityProvider>
  );
}

export default App;
