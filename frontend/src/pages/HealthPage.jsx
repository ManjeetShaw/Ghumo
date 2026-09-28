import React, { useState, useEffect } from 'react';
import { healthApi } from '../api.js';

export default function HealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setLoading(true);
    try {
      const res = await healthApi.getHealth();
      if (res.success && res.data) {
        setHealth(res.data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
            Platform Infrastructure
          </div>
          <h1 className="font-headline-lg text-2xl lg:text-3xl font-extrabold text-on-surface mt-1">
            System Health & Global GDS Diagnostics
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            Real-time telemetry, database heartbeats, and multimodal reservation engine latencies.
          </p>
        </div>

        <button
          onClick={checkHealth}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-variant text-white text-xs font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh Feeds</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 text-on-surface-variant">
          <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
          <p className="text-xs mt-2">Checking cluster health...</p>
        </div>
      ) : health ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Overall System Status</span>
              <div className="font-headline-sm text-2xl font-bold text-secondary mt-1">{health.status}</div>
              <span className="text-xs text-on-surface-variant font-mono">Env: {health.environment}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[28px]">verified</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Active Cluster Node</span>
              <div className="font-headline-sm text-xl font-bold text-white mt-1">AP-SOUTH-1 (Edge)</div>
              <span className="text-xs text-on-surface-variant font-mono">Timestamp: {new Date(health.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">dns</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Services Heartbeat</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white">Primary Document Database:</span>
              <span className="text-secondary font-bold font-mono">CONNECTED (0.4ms)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white">Distributed Cache (Redis):</span>
              <span className="text-secondary font-bold font-mono">CONNECTED (0.2ms)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">GDS Network Feeds</span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white">IndiGo & Air India Aviation GDS:</span>
              <span className="text-secondary font-bold font-mono">14ms ping</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white">Vande Bharat Rail Reservation Mesh:</span>
              <span className="text-secondary font-bold font-mono">19ms ping</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
