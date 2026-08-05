import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table-row' | 'chart' | 'text';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="border-b border-[#f1f3f6]">
            <td className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full shimmer-bg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 shimmer-bg rounded w-28" />
                  <div className="h-2.5 shimmer-bg rounded w-36 opacity-60" />
                </div>
              </div>
            </td>
            <td className="py-4 px-4">
              <div className="space-y-1.5">
                <div className="h-3 shimmer-bg rounded w-32" />
                <div className="h-2.5 shimmer-bg rounded w-24 opacity-60" />
              </div>
            </td>
            <td className="py-4 px-4">
              <div className="h-3 shimmer-bg rounded w-32" />
            </td>
            <td className="py-4 px-4">
              <div className="h-6 shimmer-bg rounded-md w-20" />
            </td>
            <td className="py-4 px-4">
              <div className="h-3 shimmer-bg rounded w-16" />
            </td>
            <td className="py-4 px-4 text-right">
              <div className="h-6 shimmer-bg rounded-md w-16 ml-auto" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-white border border-[#e4e7ec] space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="h-3 shimmer-bg rounded w-28" />
              <div className="w-7 h-7 rounded-lg shimmer-bg" />
            </div>
            <div className="h-8 shimmer-bg rounded w-24" />
            <div className="h-2.5 shimmer-bg rounded w-36 opacity-60" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-6 rounded-xl bg-white border border-[#e4e7ec] space-y-4 shadow-sm">
        <div className="h-4 shimmer-bg rounded w-48" />
        <div className="h-48 bg-[#f8f9fb] rounded-lg flex items-end justify-between p-4 gap-2 border border-[#e4e7ec]/60">
          {Array.from({ length: 12 }).map((_, j) => (
            <div
              key={j}
              className="shimmer-bg rounded-t w-full"
              style={{ height: `${Math.floor(Math.random() * 60 + 20)}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((_, i) => (
        <div key={i} className="h-4 shimmer-bg rounded w-full" />
      ))}
    </div>
  );
};
