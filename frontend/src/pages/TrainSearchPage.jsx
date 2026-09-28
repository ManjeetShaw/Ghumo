import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';

export default function TrainSearchPage({ onProceedToCheckout }) {
  const [origin, setOrigin] = useState('TVC');
  const [destination, setDestination] = useState('KGQ');
  const [classCode, setClassCode] = useState('EC');
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedBerth, setSelectedBerth] = useState('12A');

  useEffect(() => {
    fetchTrains();
  }, [origin, destination, classCode]);

  async function fetchTrains() {
    setLoading(true);
    try {
      const res = await searchApi.searchTrains({ origin, destination, classCode });
      if (res.success && res.data) {
        setTrains(res.data);
        if (res.data.length > 0) {
          setSelectedTrain(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to search trains:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleBookTrain = () => {
    if (!selectedTrain) return;
    const currentClass = selectedTrain.classes.find(c => c.code === classCode) || selectedTrain.classes[0];
    onProceedToCheckout?.({
      category: 'TRAIN',
      vendorItemId: selectedTrain.id,
      itemDetails: {
        trainName: selectedTrain.trainName,
        trainNumber: selectedTrain.trainNumber,
        origin: selectedTrain.origin,
        destination: selectedTrain.destination,
        originCity: selectedTrain.originCity,
        destinationCity: selectedTrain.destinationCity,
        departureTime: selectedTrain.departureTime,
        arrivalTime: selectedTrain.arrivalTime,
        coach: `${currentClass.name} (${classCode})`
      },
      passengers: [{ seatNumber: selectedBerth }],
      pricing: {
        baseFare: currentClass.fare,
        tax: 0,
        platformFee: 0,
        discount: 0,
        totalAmount: currentClass.fare,
        currency: 'INR'
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">train</span>
            National High-Speed Railway Graph
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Rail Search & Berth Matrix
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Vande Bharat, Tejas Express, and Rajdhani premium panoramic carriages.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-xs text-on-surface font-semibold">Rail Inventory Live</span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl border border-surface-container-high/60 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">From Station</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="TVC / NDLS"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">To Station</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="KGQ / AGC"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Class Tier</label>
          <select
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
          >
            <option value="EC">EC - Exec Chair Car</option>
            <option value="CC">CC - AC Chair Car</option>
            <option value="1A">1A - First AC Sleeper</option>
            <option value="2A">2A - 2 Tier AC</option>
            <option value="3A">3A - 3 Tier AC</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchTrains}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Update Search</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Trains List & Berth Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trains List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center justify-between">
            <span>High-Speed Express Services</span>
            {loading && <span className="material-symbols-outlined text-primary animate-spin text-base">refresh</span>}
          </h2>

          {trains.map((t) => {
            const isSelected = selectedTrain?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrain(t)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-4 ${
                  isSelected
                    ? 'bg-surface-container/90 border-secondary shadow-xl ring-1 ring-secondary/40'
                    : 'bg-surface-container-low/70 border-surface-container-high hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-[10px] text-tertiary font-bold uppercase tracking-wider">
                      Train #{t.trainNumber}
                    </span>
                    <h3 className="font-title-md text-lg font-bold text-white mt-0.5">{t.trainName}</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant font-mono">
                      {t.originCity} ({t.origin}) → {t.destinationCity} ({t.destination})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-body-sm text-[11px] text-on-surface-variant">Duration</span>
                    <div className="font-headline-sm text-base font-bold text-primary">{t.duration}</div>
                  </div>
                </div>

                {/* Class options pill bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {t.classes.map((c) => {
                    const isClassActive = classCode === c.code;
                    return (
                      <div
                        key={c.code}
                        onClick={(e) => {
                          e.stopPropagation();
                          setClassCode(c.code);
                          setSelectedTrain(t);
                        }}
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          isClassActive
                            ? 'bg-secondary-container/60 border-secondary text-white'
                            : 'bg-surface-container-high/40 border-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{c.name}</span>
                          <span className="font-mono text-[10px] text-secondary">{c.code}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-container-high/60">
                          <span className="font-bold text-tertiary text-sm">₹{c.fare}</span>
                          <span className="text-[10px] text-secondary font-semibold">{c.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Berth Availability Matrix (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {selectedTrain && (
            <div className="p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high/60 shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Rail Berth Availability Matrix
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant font-mono">
                    Coach E1 (Executive Chair / Berth Deck)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-bold">
                  Berth: {selectedBerth}
                </span>
              </div>

              {/* Berth Visual Matrix */}
              <div className="p-4 rounded-xl bg-surface-container-high/50 border border-surface-container-high flex flex-col gap-3">
                <div className="text-[11px] text-on-surface-variant font-medium text-center">
                  Direction of Train Movement →
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  {selectedTrain.berths?.map((b) => {
                    const isSelected = selectedBerth === b.number;
                    const isOccupied = b.status === 'occupied';
                    return (
                      <div
                        key={b.number}
                        onClick={() => !isOccupied && setSelectedBerth(b.number)}
                        className={`p-3.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                          isOccupied
                            ? 'bg-surface-variant/30 border-transparent opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-secondary-container border-secondary text-white shadow-lg ring-2 ring-secondary/50'
                            : 'bg-surface-container-high/80 border-surface-container-high hover:bg-surface-variant text-on-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm">{b.number}</span>
                          <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-secondary' : 'text-outline-variant'}`}>
                            single_bed
                          </span>
                        </div>
                        <span className="text-xs text-on-surface-variant">{b.type}</span>
                        <span className={`text-[10px] font-semibold mt-1 ${isOccupied ? 'text-error' : 'text-secondary'}`}>
                          {isOccupied ? 'Occupied' : 'Available'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-around text-[10px] text-on-surface-variant pt-2 border-t border-surface-container-high/40">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-secondary-container border border-secondary" />
                    <span>Selected Berth</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-surface-container-high border border-outline-variant" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-surface-variant opacity-40" />
                    <span>Booked</span>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-surface-container-high flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Selected Service:</span>
                  <span className="font-bold text-white">{selectedTrain.trainName}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Class:</span>
                  <span className="font-mono text-secondary font-bold">{classCode}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Assigned Berth:</span>
                  <span className="font-mono text-white font-bold">{selectedBerth} (Window)</span>
                </div>
                <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-sm font-bold text-on-surface">
                  <span>Total Fare:</span>
                  <span className="text-tertiary font-headline-sm text-lg font-bold">
                    ₹{selectedTrain.classes.find(c => c.code === classCode)?.fare || 2490}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBookTrain}
                className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Reserve Berth & Proceed</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
