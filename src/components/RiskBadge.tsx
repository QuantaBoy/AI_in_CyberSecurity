import React from 'react';
import type { ClassificationType } from '../types/security';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiskBadgeProps {
  score: number;
  classification: ClassificationType;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  classification,
  showBar = true,
  size = 'md'
}) => {
  const getBadgeStyle = () => {
    switch (classification) {
      case 'blocked':
        return {
          container: 'bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c]',
          barColor:  'bg-[#b91c1c]',
          label: 'Blocked',
          icon: ShieldAlert
        };
      case 'suspicious':
        return {
          container: 'bg-[#fffbeb] border border-[#fde68a] text-[#b45309]',
          barColor:  'bg-[#b45309]',
          label: 'Suspicious',
          icon: AlertTriangle
        };
      case 'normal':
      default:
        return {
          container: 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]',
          barColor:  'bg-[#15803d]',
          label: 'Normal',
          icon: ShieldCheck
        };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-1 text-[11px] font-semibold gap-1',
    lg: 'px-2.5 py-1.5 text-xs font-semibold gap-1.5'
  }[size];

  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center rounded-md ${style.container} ${sizeClasses}`}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>{style.label}</span>
        <span className="opacity-60 font-mono ml-0.5">({score.toFixed(2)})</span>
      </div>

      {showBar && (
        <div className="w-full bg-[#e4e7ec] rounded-full h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${style.barColor}`}
            style={{ width: `${Math.min(100, Math.max(4, score * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
};
