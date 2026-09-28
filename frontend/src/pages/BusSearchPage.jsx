import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';

export default function BusSearchPage({ onProceedToCheckout }) {
  const [origin, setOrigin] = useState('BLR');
  const [destination, setDestination] = useState('COK');
  const [busType, setBusType] = useState('');
  const [minRating, setMinRating] = useState(4.0);

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState('U1');

  useEffect(() => {
    fetchBuses();
  }, [origin, destination, busType, minRating]);

  async function fetchBuses() {
    setLoading(true);
    try {
      const res = await searchApi.searchBuses({ origin, destination, busType, minRating });
      if (res.success && res.data) {
        setBuses(res.data);
        if (res.data.length > 0) setSelectedBus(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to search buses:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleBookBus = () => {
    if (!selectedBus) return;
    const seatObj = selectedBus.seatMatrix?.find(s => s.seat === selectedSeat);
    const fare = seatObj ? seatObj.price : selectedBus.fare;

    onProceedToCheckout?.({
      category: 'BUS',
      vendorItemId: selectedBus.id,
      itemDetails: {
        operator: selectedBus.operator,
        busType: selectedBus.busType,
        origin: selectedBus.origin,
        destination: selectedBus.destination,
        originCity: selectedBus.originCity,
        destinationCity: selectedBus.destinationCity,
        departureTime: selectedBus.departureTime,
        arrivalTime: selectedBus.arrivalTime,
        seat: `${selectedSeat} (${seatObj?.type || 'Sleeper'})`
      },
      passengers: [{ seatNumber: selectedSeat }],
      pricing: {
        baseFare: fare,
        tax: 0,
        platformFee: 0,
        discount: 0,
        totalAmount: fare,
        currency: 'INR'
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-tertiary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">directions_bus</span>
            Intercity Express Lounge Networks
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Intercity Bus Search & Seat Matrix
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Multi-axle AC Sleepers, live tracking, and guaranteed individual air-conditioned capsules.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-xs text-on-surface font-semibold">Live GPS Connected</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl border border-surface-container-high/60 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Origin City</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="BLR / DEL"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Destination City</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="COK / JAI"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Bus Class</label>
          <select
            value={busType}
            onChange={(e) => setBusType(e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="AC Sleeper">AC Sleeper</option>
            <option value="AC Seater">AC Seater</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchBuses}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-title-md text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search Buses</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Buses List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center justify-between">
            <span>Verified Bus Operators</span>
            {loading && <span className="material-symbols-outlined text-primary animate-spin text-base">refresh</span>}
          </h2>

          {buses.map((b) => {
            const isSelected = selectedBus?.id === b.id;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBus(b)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-4 ${
                  isSelected
                    ? 'bg-surface-container/90 border-tertiary shadow-xl ring-1 ring-tertiary/40'
                    : 'bg-surface-container-low/70 border-surface-container-high hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-base font-bold text-white">{b.operator}</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-secondary text-[10px] font-bold">
                        ★ {b.rating}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-mono mt-0.5 block">{b.busType}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-headline-sm text-xl font-bold text-tertiary">₹{b.fare}</span>
                    <span className="text-[11px] text-secondary block">{b.seatsAvailable} seats left</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-surface-container-high/40 p-3 rounded-xl border border-surface-container-high/30">
                  <div>
                    <span className="text-xs text-on-surface-variant font-medium">Departure</span>
                    <div className="font-bold text-sm text-white">
                      {new Date(b.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="text-[10px] text-on-surface-variant">{b.originCity}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-on-surface-variant">{b.duration}</span>
                    <span className="material-symbols-outlined text-primary text-[18px] my-0.5">arrow_forward</span>
                    <span className="text-[10px] text-secondary font-medium">Overnight Sleeper</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant font-medium">Arrival</span>
                    <div className="font-bold text-sm text-white">
                      {new Date(b.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="text-[10px] text-on-surface-variant">{b.destinationCity}</span>
                  </div>
                </div>

                {b.boardingPoints && (
                  <div className="text-[11px] text-on-surface-variant border-t border-surface-container-high/40 pt-2 flex flex-wrap gap-2">
                    <span className="font-semibold text-white">Boarding:</span>
                    {b.boardingPoints.join(' • ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Seat Matrix (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {selectedBus && (
            <div className="p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high/60 shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Bus Sleeper Matrix
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    {selectedBus.operator}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-[11px] font-bold">
                  Seat: {selectedSeat}
                </span>
              </div>

              {/* Deck Layout */}
              <div className="p-4 rounded-xl bg-surface-container-high/50 border border-surface-container-high flex flex-col gap-4">
                <span className="font-label-sm text-[10px] text-secondary font-bold uppercase tracking-wider text-center">
                  Upper / Lower Deck Layout
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {selectedBus.seatMatrix?.map((s) => {
                    const isSelected = selectedSeat === s.seat;
                    const isOccupied = s.status === 'occupied';
                    return (
                      <div
                        key={s.seat}
                        onClick={() => !isOccupied && setSelectedSeat(s.seat)}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                          isOccupied
                            ? 'bg-surface-variant/30 border-transparent opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-tertiary/20 border-tertiary text-white shadow-lg ring-2 ring-tertiary/50'
                            : 'bg-surface-container-high/80 border-surface-container-high hover:bg-surface-variant text-on-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-white">{s.seat}</span>
                          <span className="material-symbols-outlined text-secondary text-[16px]">airline_seat_flat</span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant mt-1">{s.type}</span>
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-container-high/60">
                          <span className="text-xs font-bold text-tertiary">₹{s.price}</span>
                          <span className={`text-[10px] font-semibold ${isOccupied ? 'text-error' : 'text-secondary'}`}>
                            {isOccupied ? 'Occupied' : 'Available'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proceed */}
              <button
                onClick={handleBookBus}
                className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Reserve Seat & Proceed</span>
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
