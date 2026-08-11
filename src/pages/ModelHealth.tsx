import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import {
  Cpu,
  Sliders,
  TrendingUp,
  RotateCw,
  Zap,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const ModelHealth: React.FC = () => {
  const { modelMetric, updateThreshold, triggerRetrainJob, events, isLoading } = useSecurity();
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainProgress, setRetrainProgress] = useState<number>(0);
  const [retrainLog, setRetrainLog] = useState<string[]>([]);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateThreshold(val);
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainProgress(10);
    setRetrainLog(['Initializing ML pipeline container...', 'Extracting labeled historical incident dataset...']);

    const interval = setInterval(() => {
      setRetrainProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 400);

    setTimeout(() => {
      setRetrainLog(prev => [...prev, 'Running Isolation Forest + Random Forest ensemble tuning...']);
    }, 800);

    setTimeout(() => {
      setRetrainLog(prev => [...prev, 'Evaluating feature drift (Evidently AI metrics)...']);
    }, 1500);

    await triggerRetrainJob();

    setRetrainProgress(100);
    setRetrainLog(prev => [...prev, '✓ Retrain completed successfully! Model promoted to production.']);
    setTimeout(() => {
      setIsRetraining(false);
      setRetrainProgress(0);
    }, 1200);
  };

  const riskBuckets = [
    { range: '0.0 - 0.2', count: events.filter(e => e.riskScore < 0.2).length, label: 'Low Risk' },
    { range: '0.2 - 0.4', count: events.filter(e => e.riskScore >= 0.2 && e.riskScore < 0.4).length, label: 'Normal' },
    { range: '0.4 - 0.6', count: events.filter(e => e.riskScore >= 0.4 && e.riskScore < 0.6).length, label: 'Suspicious' },
    { range: '0.6 - 0.8', count: events.filter(e => e.riskScore >= 0.6 && e.riskScore < 0.8).length, label: 'High Risk' },
    { range: '0.8 - 1.0', count: events.filter(e => e.riskScore >= 0.8).length, label: 'Critical' }
  ];

  const performanceCurve = [
    { threshold: 0.2, recall: 0.98, precision: 0.72, fpr: 0.22 },
    { threshold: 0.3, recall: 0.94, precision: 0.82, fpr: 0.14 },
    { threshold: 0.4, recall: modelMetric.recall, precision: modelMetric.precision, fpr: modelMetric.falsePositiveRate },
    { threshold: 0.5, recall: 0.82, precision: 0.94, fpr: 0.05 },
    { threshold: 0.6, recall: 0.74, precision: 0.99, fpr: 0.03 },
    { threshold: 0.7, recall: 0.65, precision: 0.99, font: 0.01 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="chart" count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Titles */}
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0d1117]">Model Health & MLOps</h1>
        <p className="text-xs text-[#555f6d] mt-1">Monitor the AI anomaly detection engine performance, precision thresholds, and feature drift.</p>
      </div>

      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Version */}
        <div className="p-5 rounded-xl bg-white border border-[#e4e7ec] shadow-sm hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-[#555f6d] uppercase tracking-wider">
              Active Production Model
            </span>
            <div className="text-xl font-extrabold text-[#0d1117] mt-1 font-mono">
              {modelMetric.version}
            </div>
            <span className="text-[11px] text-[#9ca3af]">
              Trained: {new Date(modelMetric.trainedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f0f2f5] flex items-center justify-center text-[#0d1117] group-hover:scale-105 transition-transform duration-150">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Recall Metric */}
        <div className="p-5 rounded-xl bg-white border border-[#e4e7ec] shadow-sm hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#555f6d] uppercase tracking-wider">
                Recall Rate
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d]">
                Target ≥ 0.85
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#15803d] mt-1">
              {(modelMetric.recall * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-[#9ca3af]">
              High threat detection sensitivity
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#15803d] group-hover:scale-105 transition-transform duration-150">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* False Positive Rate */}
        <div className="p-5 rounded-xl bg-white border border-[#e4e7ec] shadow-sm hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#555f6d] uppercase tracking-wider">
                False Positive Rate
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#fffbeb] border border-[#fde68a] text-[#b45309]">
                Target &lt; 15%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-[#b45309] mt-1">
              {(modelMetric.falsePositiveRate * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-[#9ca3af]">
              Low-noise alert feed
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#fffbeb] flex items-center justify-center text-[#b45309] group-hover:scale-105 transition-transform duration-150">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* F1 Score */}
        <div className="p-5 rounded-xl bg-white border border-[#e4e7ec] shadow-sm hover:border-[#c8cdd6] transition-colors flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-[#555f6d] uppercase tracking-wider">
              Overall F1-Score
            </span>
            <div className="text-2xl font-extrabold text-[#0d1117] mt-1 font-mono">
              {modelMetric.f1Score.toFixed(3)}
            </div>
            <span className="text-[11px] text-[#9ca3af]">
              Evaluated on {modelMetric.totalEvaluated.toLocaleString()} events
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f0f2f5] flex items-center justify-center text-[#0d1117] group-hover:scale-105 transition-transform duration-150">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Threshold Tuner & Retrain Pipeline Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Anomaly Threshold Tuner */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-[#e4e7ec] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#f0f2f5] border border-[#e4e7ec] text-[#0d1117]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0d1117] text-sm">
                  Interactive Anomaly Threshold Tuner
                </h3>
                <p className="text-xs text-[#555f6d] mt-0.5">
                  Dynamically balance Recall (catching threats) vs False Positive Rate
                </p>
              </div>
            </div>

            <span className="font-mono font-extrabold text-lg text-[#0d1117] bg-[#f8f9fb] px-3 py-1 rounded-lg border border-[#e4e7ec]">
              {modelMetric.threshold.toFixed(2)}
            </span>
          </div>

          {/* Slider input */}
          <div className="space-y-2">
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.02"
              value={modelMetric.threshold}
              onChange={handleThresholdChange}
              className="w-full accent-[#0d1117] cursor-pointer h-2 bg-[#f0f2f5] rounded-lg border border-[#e4e7ec] transition-all"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#555f6d]">
              <span>0.10 (High Sensitivity / Max Recall)</span>
              <span>0.40 (Optimal Balanced)</span>
              <span>0.80 (Conservative / Min FPR)</span>
            </div>
          </div>

          {/* Precision vs Recall Curve Chart */}
          <div className="h-56 pt-2">
            <span className="text-xs font-semibold text-[#555f6d] block mb-3">
              Simulated Threshold Performance Curve (Recall vs Precision)
            </span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f6" />
                <XAxis dataKey="threshold" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e7ec', borderRadius: '8px', fontSize: '11px', color: '#0d1117' }}
                />
                <Area type="monotone" dataKey="recall" stroke="#15803d" fill="#f0fdf4" fillOpacity={0.6} name="Recall" />
                <Area type="monotone" dataKey="precision" stroke="#0d1117" fill="#f8f9fb" fillOpacity={0.4} name="Precision" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Drift & One-Click Retrain Engine */}
        <div className="p-6 rounded-xl bg-white border border-[#e4e7ec] shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#0d1117] text-sm mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#555f6d]" />
              Evidently AI Feature Drift Gauges
            </h3>
            <p className="text-xs text-[#555f6d] mb-4">
              Real-time monitoring of input feature distribution shifts
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-[#555f6d] font-semibold mb-1">
                  <span>Geographical Distance Drift</span>
                  <span className="text-[#15803d] font-mono">{modelMetric.geoDrift}% (Low)</span>
                </div>
                <div className="w-full bg-[#f8f9fb] rounded-full h-1.5 overflow-hidden border border-[#e4e7ec]">
                  <div className="bg-[#15803d] h-full transition-all duration-500" style={{ width: `${modelMetric.geoDrift * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#555f6d] font-semibold mb-1">
                  <span>Device Fingerprint Drift</span>
                  <span className="text-[#b45309] font-mono">{modelMetric.deviceDrift}% (Nominal)</span>
                </div>
                <div className="w-full bg-[#f8f9fb] rounded-full h-1.5 overflow-hidden border border-[#e4e7ec]">
                  <div className="bg-[#b45309] h-full transition-all duration-500" style={{ width: `${modelMetric.deviceDrift * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#555f6d] font-semibold mb-1">
                  <span>Time-of-Day Z-Score Drift</span>
                  <span className="text-[#15803d] font-mono">{modelMetric.timeDrift}% (Low)</span>
                </div>
                <div className="w-full bg-[#f8f9fb] rounded-full h-1.5 overflow-hidden border border-[#e4e7ec]">
                  <div className="bg-[#15803d] h-full transition-all duration-500" style={{ width: `${modelMetric.timeDrift * 10}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* One-Click Retrain Engine */}
          <div className="p-4 rounded-lg bg-[#f8f9fb] border border-[#e4e7ec] space-y-3">
            <span className="block text-xs font-bold text-[#0d1117]">
              Model Retraining Pipeline
            </span>

            {isRetraining ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#0d1117] font-mono font-semibold">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    Retraining...
                  </span>
                  <span>{retrainProgress}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-[#e4e7ec]">
                  <div className="bg-[#0d1117] h-full transition-all duration-300" style={{ width: `${retrainProgress}%` }} />
                </div>
                <div className="p-2 rounded border border-[#e4e7ec] bg-white text-[10px] font-mono text-[#555f6d] max-h-24 overflow-y-auto space-y-1">
                  {retrainLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={handleRetrain}
                className="w-full py-2.5 rounded-lg bg-[#0d1117] hover:bg-[#1c2537] text-white font-bold text-xs shadow-sm transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Retrain & Promote Model</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Risk Distribution Chart */}
      <div className="p-6 rounded-xl bg-white border border-[#e4e7ec] shadow-sm space-y-4">
        <h3 className="font-bold text-[#0d1117] text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#555f6d]" />
          Ingested Events Risk Score Distribution Histogram
        </h3>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f6" />
              <XAxis dataKey="range" stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e7ec', borderRadius: '8px', fontSize: '11px', color: '#0d1117' }}
              />
              {/* Custom colored bars for buckets */}
              <Bar dataKey="count" fill="#0d1117" radius={[4, 4, 0, 0]} name="Events Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
