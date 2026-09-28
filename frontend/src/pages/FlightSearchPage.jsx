import React, { useState, useEffect } from 'react';
import { searchApi } from '../api.js';

export default function FlightSearchPage({ onProceedToCheckout }) {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('COK');
  const [maxPrice, setMaxPrice] = useState(40000);
  const [airline, setAirline] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState('4F');
  const [promoCode, setPromoCode] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    fetchFlights();
  }, [origin, destination, maxPrice, airline, sortBy]);

  async function fetchFlights() {
    setLoading(true);
    try {
      const res = await searchApi.searchFlights({
        origin,
        destination,
        maxPrice,
        airline,
        sortBy
      });
      if (res.success && res.data) {
        setFlights(res.data);
        if (res.data.length > 0 && !selectedFlight) {
          setSelectedFlight(res.data[0]);
          calculateQuote(res.data[0].price.baseFare, promoCode);
        }
      }
    } catch (err) {
      console.error('Failed to search flights:', err);
    } finally {
      setLoading(false);
    }
  }

  async function calculateQuote(baseFare, promo) {
    setQuoting(true);
    try {
      const res = await searchApi.getPriceQuote({
        category: 'FLIGHT',
        baseFare: baseFare,
        passengers: 1,
        promoCode: promo
      });
      if (res.success && res.data) {
        setQuote(res.data);
      }
    } catch (err) {
      console.error('Failed to get quote:', err);
    } finally {
      setQuoting(false);
    }
  }

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    calculateQuote(flight.price.baseFare, promoCode);
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (selectedFlight) {
      calculateQuote(selectedFlight.price.baseFare, promoCode);
    }
  };

  const handleBookNow = () => {
    if (!selectedFlight) return;
    onProceedToCheckout?.({
      category: 'FLIGHT',
      vendorItemId: selectedFlight.id,
      itemDetails: {
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        originCity: selectedFlight.originCity,
        destinationCity: selectedFlight.destinationCity,
        departureTime: selectedFlight.departureTime,
        arrivalTime: selectedFlight.arrivalTime,
        cabinClass: selectedFlight.cabinClass
      },
      passengers: [{ seatNumber: selectedSeat }],
      pricing: {
        baseFare: quote ? quote.baseFare : selectedFlight.price.baseFare,
        tax: quote ? quote.gstTax : selectedFlight.price.tax,
        platformFee: quote ? quote.platformFee : 0,
        discount: quote ? quote.discount : 0,
        totalAmount: quote ? quote.finalAmount : selectedFlight.price.total,
        currency: 'INR'
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">flight</span>
            Live Flight Inventory
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Flight Search & Live Seat Matrix
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Real-time cabin pressure, window vista indexing, and live baggage allocations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-label-sm text-xs text-on-surface font-semibold">GDS Feeds: 100% Online</span>
        </div>
      </div>

      {/* Search Filters Bar */}
      <div className="p-4 rounded-2xl bg-surface-container-low/90 backdrop-blur-xl border border-surface-container-high/60 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Origin</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="DEL / CCU"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none"
            placeholder="COK / DPS"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Max Price: ₹{maxPrice}</label>
          <input
            type="range"
            min="3000"
            max="50000"
            step="1000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Airline Filter</label>
          <select
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
          >
            <option value="">All Airlines</option>
            <option value="IndiGo">IndiGo</option>
            <option value="Air India">Air India</option>
            <option value="Singapore">Singapore Airlines</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
          >
            <option value="price_asc">Price: Lowest First</option>
            <option value="duration_asc">Fastest Duration</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Flights List & Aircraft Seat Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Flight Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center justify-between">
            <span>Available Flights ({flights.length})</span>
            {loading && <span className="material-symbols-outlined text-primary animate-spin text-base">refresh</span>}
          </h2>

          {flights.map((f) => {
            const isSelected = selectedFlight?.id === f.id;
            return (
              <div
                key={f.id}
                onClick={() => handleSelectFlight(f)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-4 ${
                  isSelected
                    ? 'bg-surface-container/90 border-primary shadow-xl ring-1 ring-primary/40'
                    : 'bg-surface-container-low/70 border-surface-container-high hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary font-bold text-xs">
                      {f.airline.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-title-md text-base font-bold text-on-surface">{f.airline}</div>
                      <div className="font-body-sm text-xs text-on-surface-variant font-mono">{f.flightNumber} • {f.cabinClass}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-headline-sm text-xl font-bold text-tertiary">₹{f.price.total}</div>
                    <span className="font-body-sm text-[11px] text-secondary">₹{f.price.baseFare} base + tax</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between bg-surface-container-high/40 p-3 rounded-xl border border-surface-container-high/30">
                  <div className="text-left">
                    <div className="font-title-md text-base font-bold text-white">{f.origin}</div>
                    <div className="text-xs text-on-surface-variant">{f.originCity}</div>
                    <div className="text-xs font-mono text-secondary mt-0.5">
                      {new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex-1 px-4 flex flex-col items-center">
                    <span className="text-[11px] text-on-surface-variant font-medium">{f.duration}</span>
                    <div className="w-full flex items-center gap-1 my-1">
                      <div className="h-0.5 bg-outline-variant flex-1" />
                      <span className="material-symbols-outlined text-primary text-[16px]">flight</span>
                      <div className="h-0.5 bg-outline-variant flex-1" />
                    </div>
                    <span className="text-[10px] text-tertiary">Non-stop GDS</span>
                  </div>

                  <div className="text-right">
                    <div className="font-title-md text-base font-bold text-white">{f.destination}</div>
                    <div className="text-xs text-on-surface-variant">{f.destinationCity}</div>
                    <div className="text-xs font-mono text-secondary mt-0.5">
                      {new Date(f.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-surface-container-high/40">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">luggage</span>
                    {f.baggageAllowance}
                  </span>
                  <span className="text-secondary font-semibold">
                    {f.availableSeats} seats remaining
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Interactive Seat Matrix & Pricing Quote (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {selectedFlight && (
            <div className="p-6 rounded-2xl bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high/60 shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Interactive Cabin Seat Matrix
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    {selectedFlight.airline} {selectedFlight.flightNumber}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[11px] font-bold">
                  Seat: {selectedSeat}
                </span>
              </div>

              {/* Aircraft Cabin Graphic */}
              <div className="p-4 rounded-xl bg-surface-container-high/50 border border-surface-container-high flex flex-col gap-3 items-center">
                <div className="w-16 h-8 rounded-t-full bg-surface-variant flex items-center justify-center text-primary text-[10px] font-bold uppercase tracking-wider">
                  Cockpit
                </div>

                {/* Seat Grid */}
                <div className="grid grid-cols-4 gap-2 w-full max-w-xs text-center">
                  {selectedFlight.seatLayout?.map((s) => {
                    const isSelected = selectedSeat === s.number;
                    const isOccupied = s.status === 'occupied';
                    return (
                      <button
                        key={s.number}
                        disabled={isOccupied}
                        onClick={() => setSelectedSeat(s.number)}
                        className={`p-2.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isOccupied
                            ? 'bg-surface-variant/40 text-outline cursor-not-allowed opacity-40'
                            : isSelected
                            ? 'bg-primary text-on-primary shadow-lg ring-2 ring-primary/50 scale-105'
                            : 'bg-surface-container-high hover:bg-surface-variant text-on-surface border border-outline-variant/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">airline_seat_recline_extra</span>
                        <span className="font-mono mt-0.5">{s.number}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 text-[10px] text-on-surface-variant mt-2">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-primary" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-surface-container-high border border-outline-variant" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-surface-variant opacity-40" />
                    <span>Occupied</span>
                  </div>
                </div>
              </div>

              {/* Promo Code Input & Server Quote */}
              <form onSubmit={handleApplyPromo} className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Server-Validated Promo Code</span>
                  <span className="text-tertiary text-[11px]">WELCOME10 (-10%)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                    className="flex-1 bg-surface-container-high px-4 py-2.5 rounded-xl text-white font-mono text-xs border border-surface-container-high focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-surface-variant hover:bg-surface-container-highest text-on-surface font-title-md text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </form>

              {/* Itemized Price Breakdown */}
              {quote && (
                <div className="p-4 rounded-xl bg-surface-container-high/60 border border-surface-container-high flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Base Fare (1 Traveler):</span>
                    <span className="font-mono text-white font-semibold">₹{quote.baseFare}</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>GST Tax (18%):</span>
                    <span className="font-mono text-white font-semibold">₹{quote.gstTax}</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Platform Fee:</span>
                    <span className="font-mono text-white font-semibold">₹{quote.platformFee}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex items-center justify-between text-secondary font-semibold">
                      <span>Promo Discount ({quote.promoCode}):</span>
                      <span className="font-mono">-₹{quote.discount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between font-bold text-sm text-on-surface">
                    <span>Total Amount:</span>
                    <span className="text-tertiary font-headline-sm text-lg font-bold">
                      ₹{quote.finalAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Proceed to Checkout CTA */}
              <button
                onClick={handleBookNow}
                className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceed to Checkout</span>
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
