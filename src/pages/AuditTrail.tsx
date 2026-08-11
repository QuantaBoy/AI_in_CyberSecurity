import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { FileText, Search, Download, ShieldCheck, User, ShieldAlert, Cpu } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs, isLoading, addToast } = useSecurity();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter(
    log =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)
  );

  const exportCsv = () => {
    const headers = 'ID,Timestamp,Actor,Role,Action,Details,IP\n';
    const rows = auditLogs
      .map(
        l =>
          `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.details.replace(
            /"/g,
            '""'
          )}","${l.ipAddress}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudguard_audit_trail_${Date.now()}.csv`;
    a.click();
    addToast({ type: 'success', title: 'Audit Trail Exported', description: 'Downloaded CSV audit ledger report' });
  };

  const getActionBadge = (action: string) => {
    if (action.includes('BLOCK')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[10px] font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('APPROVE') || action.includes('CONFIRMED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-[10px] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('RETRAIN') || action.includes('THRESHOLD')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f0f2f5] border border-[#e4e7ec] text-[#0d1117] text-[10px] font-bold uppercase tracking-wider">
          <Cpu className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f8f9fb] border border-[#e4e7ec] text-[#555f6d] text-[10px] font-bold uppercase tracking-wider">
        <FileText className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="p-6 rounded-xl bg-white border border-[#e4e7ec] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#f0f2f5] border border-[#e4e7ec] text-[#0d1117]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0d1117] flex items-center gap-2">
              Immutable Security Audit Trail
            </h2>
            <p className="text-xs text-[#555f6d] mt-0.5">
              Cryptographically verified ledger of all classifications, analyst decisions, & threshold updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-[#e4e7ec] text-xs text-[#0d1117] focus:outline-none focus:border-[#0d1117] transition-colors"
            />
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#e4e7ec] bg-white hover:bg-[#f8f9fb] text-[#0d1117] font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl bg-white border border-[#e4e7ec] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-[#e4e7ec] text-[#555f6d] uppercase font-semibold tracking-wider">
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Actor</th>
                <th className="py-3 px-4 font-medium">Action</th>
                <th className="py-3 px-4 font-medium">Audit Record Details</th>
                <th className="py-3 px-4 text-right font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f6]">
              {isLoading ? (
                <SkeletonLoader type="table-row" count={4} />
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#9ca3af]">
                    No audit records match your search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td className="py-3.5 px-4 text-[#555f6d] font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[#0d1117]">
                        <User className="w-3.5 h-3.5 text-[#9ca3af]" />
                        <span className="font-semibold">{log.actorName}</span>
                        <span className="text-[10px] text-[#9ca3af]">({log.actorRole})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3.5 px-4 text-[#555f6d] font-sans leading-normal">{log.details}</td>
                    <td className="py-3.5 px-4 text-right text-[#555f6d] font-mono">{log.ipAddress}</td>
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
