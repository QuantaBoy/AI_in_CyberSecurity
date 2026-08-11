import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { RiskBadge } from '../components/RiskBadge';
import { SkeletonLoader } from '../components/SkeletonLoader';
import {
  Globe,
  Smartphone,
  Info,
  Clock,
  Ban,
  CheckCircle,
  Activity,
  AlertTriangle,
  Check,
  Zap,
  ChevronRight,
  Copy,
  Search
} from 'lucide-react';

export const AdminFeed: React.FC = () => {
  const {
    events,
    alerts,
    setSelectedEvent,
    blockSession,
    approveLogin,
    setIsSimulatorOpen,
    activeFilter,
    setActiveFilter,
    isLoading,
    addToast
  } = useSecurity();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const handleCopyIp = (e: React.MouseEvent, ip: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    addToast({ type: 'info', title: 'IP Copied', description: `Copied ${ip} to clipboard` });
    setTimeout(() => setCopiedIp(null), 1500);
  };

  const filteredEvents = events.filter(evt => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'critical'
        ? evt.classification === 'blocked'
        : activeFilter === 'suspicious'
        ? evt.classification === 'suspicious'
        : evt.classification === 'normal';

    const matchesSearch =
      searchTerm === '' ||
      evt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.ipAddress.includes(searchTerm) ||
      evt.geoCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.geoCity.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalEvents = events.length;
  const criticalCount = events.filter(e => e.classification === 'blocked').length;
  const suspiciousCount = events.filter(e => e.classification === 'suspicious').length;
  const normalCount = events.filter(e => e.classification === 'normal').length;
  const openAlertsCount = alerts.filter(a => a.status === 'flagged').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#0d1117]">Live Security Feed</h1>
          <p className="text-xs text-[#555f6d] mt-1">Real-time monitoring of authentication events and network activity.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803d] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803d]" />
          </span>
          <span className="text-xs font-semibold">System Active</span>
        </div>
      </div>

      {/* KPI Tiles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-sm p-5 hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-xs font-semibold text-[#555f6d] uppercase tracking-wider">Auth Events</h3>
            <div className="text-[32px] font-extrabold text-[#0d1117] mt-1 tracking-tight">
              {totalEvents}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#15803d] font-semibold">
              <span>100% ingested · P95 &lt; 1s</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f0f2f5] flex items-center justify-center text-[#555f6d] group-hover:scale-105 transition-transform duration-150">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-sm p-5 hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-xs font-semibold text-[#b91c1c] uppercase tracking-wider">Blocked Access</h3>
            <div className="text-[32px] font-extrabold text-[#0d1117] mt-1 tracking-tight">
              {criticalCount}
            </div>
            <div className="mt-1.5 text-[11px] text-[#9ca3af]">Auto-Enforced</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#b91c1c] group-hover:scale-105 transition-transform duration-150">
            <Ban className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-sm p-5 hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-xs font-semibold text-[#b45309] uppercase tracking-wider">Suspicious events</h3>
            <div className="text-[32px] font-extrabold text-[#0d1117] mt-1 tracking-tight flex items-baseline gap-2">
              {suspiciousCount}
              {openAlertsCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#b45309]">
                  {openAlertsCount} Open
                </span>
              )}
            </div>
            <div className="mt-1.5 text-[11px] text-[#9ca3af]">Currently under review</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#fffbeb] flex items-center justify-center text-[#b45309] group-hover:scale-105 transition-transform duration-150">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-sm p-5 hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <h3 className="text-xs font-semibold text-[#555f6d] uppercase tracking-wider">Normal Traffic %</h3>
            <div className="text-[32px] font-extrabold text-[#0d1117] mt-1 tracking-tight">
              {totalEvents > 0 ? `${((normalCount / totalEvents) * 100).toFixed(1)}%` : '100%'}
            </div>
            <div className="mt-1.5 text-[11px] text-[#9ca3af]">Within historical bounds</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#15803d] group-hover:scale-105 transition-transform duration-150">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter / Search Control Bar */}
      <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Filter segment control tabs */}
        <div className="flex items-center gap-1 bg-[#f8f9fb] p-1 rounded-lg border border-[#e4e7ec] w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-[#0d1117] shadow-sm'
                : 'text-[#555f6d] hover:text-[#0d1117]'
            }`}
          >
            All ({totalEvents})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'critical'
                ? 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] shadow-sm'
                : 'text-[#555f6d] hover:text-[#b91c1c]'
            }`}
          >
            Blocked ({criticalCount})
          </button>
          <button
            onClick={() => setActiveFilter('suspicious')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'suspicious'
                ? 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a] shadow-sm'
                : 'text-[#555f6d] hover:text-[#b45309]'
            }`}
          >
            Suspicious ({suspiciousCount})
          </button>
          <button
            onClick={() => setActiveFilter('normal')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeFilter === 'normal'
                ? 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] shadow-sm'
                : 'text-[#555f6d] hover:text-[#15803d]'
            }`}
          >
            Normal ({normalCount})
          </button>
        </div>

        {/* Search Input & Action Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search user, IP, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#e4e7ec] text-xs text-[#0d1117] focus:outline-none focus:border-[#0d1117] transition-colors"
            />
          </div>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0d1117] hover:bg-[#1c2537] text-white font-bold text-xs shadow-sm transition-all duration-150 transform hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Traffic</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-[#e4e7ec] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#e4e7ec] text-[#555f6d] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Location &amp; IP</th>
                <th className="py-3 px-4 font-medium">Device Fingerprint</th>
                <th className="py-3 px-4 font-medium">AI Risk Score</th>
                <th className="py-3 px-4 font-medium">Time</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f6]">
              {isLoading ? (
                <SkeletonLoader type="table-row" count={4} />
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#9ca3af]">
                    No authentication events match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(evt => (
                  <tr
                    key={evt.id}
                    className="h-14 hover:bg-[#f8f9fb] transition-colors duration-150 group cursor-pointer"
                    onClick={() => setSelectedEvent(evt)}
                  >
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f0f2f5] border border-[#e4e7ec] flex items-center justify-center font-bold text-[#0d1117]">
                          {evt.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0d1117]">
                            {evt.userName}
                          </div>
                          <div className="text-[11px] text-[#9ca3af]">{evt.userEmail}</div>
                        </div>
                      </div>
                    </td>

                    {/* Location & IP */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[#0d1117]">
                        <Globe className="w-3.5 h-3.5 text-[#555f6d]" />
                        <span className="font-semibold">{evt.geoCity}, {evt.geoCountry}</span>
                        {evt.features.geoDistanceScore > 0.6 && (
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]">
                            NEW GEO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#555f6d] font-mono mt-0.5 flex items-center gap-1">
                        <span>IP: {evt.ipAddress}</span>
                        <button
                          onClick={e => handleCopyIp(e, evt.ipAddress)}
                          className="p-0.5 text-[#9ca3af] hover:text-[#0d1117] transition-colors"
                          title="Copy IP"
                        >
                          {copiedIp === evt.ipAddress ? <Check className="w-3 h-3 text-[#15803d]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[#555f6d]">
                        <Smartphone className="w-3.5 h-3.5 text-[#9ca3af]" />
                        <span>{evt.deviceOS} / {evt.deviceBrowser}</span>
                      </div>
                      {evt.isNewDevice && (
                        <span className="inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#fffbeb] border border-[#fde68a] text-[#b45309] uppercase">
                          Unseen Device
                        </span>
                      )}
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4">
                      <RiskBadge score={evt.riskScore} classification={evt.classification} size="sm" />
                    </td>

                    {/* Time */}
                    <td className="py-3 px-4 text-[#555f6d] font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#9ca3af]" />
                        <span>{new Date(evt.eventTime).toLocaleTimeString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="p-1.5 rounded-lg border border-[#e4e7ec] hover:bg-[#f8f9fb] text-[#555f6d] transition-colors transform active:scale-95"
                          title="Explainable AI Feature Breakdown"
                        >
                          <Info className="w-4 h-4" />
                        </button>

                        {evt.classification !== 'blocked' && (
                          <button
                            onClick={() => blockSession(evt.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] font-bold text-[11px] transition-all transform active:scale-95 shadow-sm"
                            title="Block session & flag user"
                          >
                            <Ban className="w-3.5 h-3.5 text-[#b91c1c]" />
                            <span>Block</span>
                          </button>
                        )}

                        {evt.classification !== 'normal' && (
                          <button
                            onClick={() => approveLogin(evt.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] font-bold text-[11px] transition-all transform active:scale-95 shadow-sm"
                            title="Approve login and add to baseline"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-[#15803d]" />
                            <span>Approve</span>
                          </button>
                        )}

                        <ChevronRight className="w-4 h-4 text-[#c8cdd6] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
