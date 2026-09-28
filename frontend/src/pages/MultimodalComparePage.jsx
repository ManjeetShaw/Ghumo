import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';

export default function MultimodalComparePage({ onProceedToCheckout, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchMultimodal();
  }, []);

  async function fetchMultimodal() {
    setLoading(true);
    try {
      const res = await searchApi.searchAll();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load multimodal comparison:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            Global Transit Graph
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Unified Multimodal Transit Comparison Engine
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Compare speed, cost, carbon footprint, and scenic immersion across Flights, High-Speed Rail, and Luxury Stays.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-xs text-on-surface font-semibold">Real-Time Aggregator Sync</span>
        </div>
      </div>

      {/* Transit Mode Filters */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-surface-container-low w-fit border border-surface-container-high">
        {[
          { id: 'ALL', label: 'All Modes Comparison', icon: 'hub' },
          { id: 'FLIGHT', label: 'Flights', icon: 'flight' },
          { id: 'TRAIN', label: 'High-Speed Rail', icon: 'train' },
          { id: 'BUS', label: 'Intercity Bus', icon: 'directions_bus' },
          { id: 'HOTEL', label: 'Sanctuary Stays', icon: 'hotel' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-xs transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-primary-container text-on-primary-container font-bold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Multi-Column Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transit 1: Flight Mode */}
        {(activeTab === 'ALL' || activeTab === 'FLIGHT') && data?.flights?.[0] && (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-primary/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary font-label-sm text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">flight</span>
                  Aviation Mode
                </span>
                <span className="font-label-sm text-[10px] text-tertiary font-bold uppercase tracking-wider">
                  Fastest Transit
                </span>
              </div>

              <h3 className="font-headline-sm text-xl font-bold text-white mt-3">
                {data.flights[0].airline} {data.flights[0].flightNumber}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                {data.flights[0].originCity} ({data.flights[0].origin}) → {data.flights[0].destinationCity} ({data.flights[0].destination})
              </p>

              <div className="mt-4 p-4 rounded-xl bg-surface-container-high/50 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total Duration:</span>
                  <span className="font-bold text-white font-mono">{data.flights[0].duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Carbon Footprint:</span>
                  <span className="text-error font-medium">142 kg CO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Comfort & Productivity:</span>
                  <span className="text-secondary font-medium">Executive Cabin 9.2/10</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant block">Total Fare</span>
                <span className="font-headline-sm text-2xl font-bold text-tertiary">₹{data.flights[0].price.total}</span>
              </div>
              <button
                onClick={() => onNavigate?.('flights')}
                className="py-2.5 px-4 rounded-full bg-primary text-on-primary font-title-md text-xs font-bold hover:bg-primary-container transition-all cursor-pointer"
              >
                Select Flight
              </button>
            </div>
          </div>
        )}

        {/* Transit 2: High-Speed Rail */}
        {(activeTab === 'ALL' || activeTab === 'TRAIN') && data?.trains?.[0] && (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-secondary/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary font-label-sm text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">train</span>
                  High-Speed Rail
                </span>
                <span className="font-label-sm text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Scenic & Eco-Friendly
                </span>
              </div>

              <h3 className="font-headline-sm text-xl font-bold text-white mt-3">
                {data.trains[0].trainName} ({data.trains[0].trainNumber})
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                {data.trains[0].originCity} ({data.trains[0].origin}) → {data.trains[0].destinationCity} ({data.trains[0].destination})
              </p>

              <div className="mt-4 p-4 rounded-xl bg-surface-container-high/50 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total Duration:</span>
                  <span className="font-bold text-white font-mono">{data.trains[0].duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Carbon Footprint:</span>
                  <span className="text-secondary font-medium font-bold">18 kg CO₂e (87% lower!)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Comfort & Panoramic:</span>
                  <span className="text-tertiary font-medium">Scenic Vista 9.8/10</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant block">Total Fare</span>
                <span className="font-headline-sm text-2xl font-bold text-tertiary">₹{data.trains[0].classes[0]?.fare}</span>
              </div>
              <button
                onClick={() => onNavigate?.('trains')}
                className="py-2.5 px-4 rounded-full bg-secondary text-on-secondary font-title-md text-xs font-bold hover:bg-secondary-fixed-dim transition-all cursor-pointer"
              >
                Select Train
              </button>
            </div>
          </div>
        )}

        {/* Transit 3: Intercity Bus */}
        {(activeTab === 'ALL' || activeTab === 'BUS') && data?.buses?.[0] && (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-tertiary/40 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-tertiary/20 text-tertiary font-label-sm text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                  Express Sleeper
                </span>
                <span className="font-label-sm text-[10px] text-tertiary font-bold uppercase tracking-wider">
                  Budget Optimized
                </span>
              </div>

              <h3 className="font-headline-sm text-xl font-bold text-white mt-3">
                {data.buses[0].operator}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                {data.buses[0].originCity} → {data.buses[0].destinationCity} ({data.buses[0].busType})
              </p>

              <div className="mt-4 p-4 rounded-xl bg-surface-container-high/50 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total Duration:</span>
                  <span className="font-bold text-white font-mono">{data.buses[0].duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Carbon Footprint:</span>
                  <span className="text-secondary font-medium">32 kg CO₂e</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Overnight Capsule:</span>
                  <span className="text-tertiary font-medium">Restful Sleeper 8.6/10</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant block">Total Fare</span>
                <span className="font-headline-sm text-2xl font-bold text-tertiary">₹{data.buses[0].fare}</span>
              </div>
              <button
                onClick={() => onNavigate?.('buses')}
                className="py-2.5 px-4 rounded-full bg-tertiary text-on-tertiary font-title-md text-xs font-bold hover:bg-tertiary-fixed-dim transition-all cursor-pointer"
              >
                Select Bus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
