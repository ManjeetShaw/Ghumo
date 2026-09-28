import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingApi, searchApi } from '../api.js';

export default function CheckoutPage({ bookingDraft, onBookingSuccess, onCancel }) {
  const { user } = useAuth();

  const [paxName, setPaxName] = useState(user?.name || '');
  const [paxAge, setPaxAge] = useState('');
  const [paxGender, setPaxGender] = useState('FEMALE');
  const [paxSeat, setPaxSeat] = useState(bookingDraft?.passengers?.[0]?.seatNumber || '');
  const [passportNum, setPassportNum] = useState(user?.passportDetails?.passportNumber || '');
  const [promoCode, setPromoCode] = useState('');

  const [pricing, setPricing] = useState(bookingDraft?.pricing || {
    baseFare: 0,
    tax: 0,
    platformFee: 0,
    discount: 0,
    totalAmount: 0,
    currency: 'INR'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    try {
      const res = await searchApi.getPriceQuote({
        category: bookingDraft?.category || 'FLIGHT',
        baseFare: pricing.baseFare,
        passengers: 1,
        promoCode
      });
      if (res.success && res.data) {
        setPricing({
          baseFare: res.data.baseFare,
          tax: res.data.gstTax,
          platformFee: res.data.platformFee,
          discount: res.data.discount,
          totalAmount: res.data.finalAmount,
          currency: res.data.currency
        });
      }
    } catch (err) {
      console.error('Failed to apply promo:', err);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        category: bookingDraft?.category || 'FLIGHT',
        vendorItemId: bookingDraft?.vendorItemId,
        itemDetails: bookingDraft?.itemDetails || {},
        promoCode: promoCode || undefined,
        passengers: [
          {
            name: paxName,
            age: Number(paxAge),
            gender: paxGender,
            seatNumber: paxSeat,
            idProof: passportNum
          }
        ],
        pricing: {
          baseFare: pricing.baseFare,
          tax: pricing.tax,
          platformFee: pricing.platformFee,
          discount: pricing.discount,
          totalAmount: pricing.totalAmount,
          currency: pricing.currency || 'INR'
        }
      };

      const res = await bookingApi.createBooking(payload);
      if (res.success && res.data) {
        onBookingSuccess?.(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Failed to initiate booking');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl lg:text-3xl font-extrabold text-on-surface">
            Checkout & Passenger Manifest
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-1">
            256-bit Border & GDS Encrypted Passenger Clearance
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-on-surface-variant hover:text-white px-3 py-1.5 rounded-full bg-surface-container-high cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-error/20 border border-error/40 text-error text-xs">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Passenger Details Form (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-lg flex flex-col gap-4">
            <h3 className="font-title-md text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              Primary Traveler Details
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Legal Full Name</label>
              <input
                type="text"
                required
                value={paxName}
                onChange={(e) => setPaxName(e.target.value)}
                className="bg-surface-container-high px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none border border-surface-container-high"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Age</label>
                <input
                  type="number"
                  value={paxAge}
                  onChange={(e) => setPaxAge(e.target.value)}
                  className="bg-surface-container-high px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none border border-surface-container-high"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Gender</label>
                <select
                  value={paxGender}
                  onChange={(e) => setPaxGender(e.target.value)}
                  className="bg-surface-container-high px-4 py-2.5 rounded-xl text-white text-sm focus:outline-none border border-surface-container-high"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Assigned Seat / Berth</label>
                <input
                  type="text"
                  value={paxSeat}
                  onChange={(e) => setPaxSeat(e.target.value)}
                  className="bg-surface-container-high px-4 py-2.5 rounded-xl text-secondary font-mono font-bold text-sm focus:outline-none border border-surface-container-high"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Passport Number</label>
                <input
                  type="text"
                  value={passportNum}
                  onChange={(e) => setPassportNum(e.target.value)}
                  className="bg-surface-container-high px-4 py-2.5 rounded-xl text-white font-mono text-sm focus:outline-none border border-surface-container-high"
                />
              </div>
            </div>
          </div>

          {/* Promo Box */}
          <form onSubmit={handleApplyPromo} className="p-4 rounded-xl bg-surface-container-high/60 border border-surface-container-high flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary text-[22px]">sell</span>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Promo Code"
              className="bg-transparent text-white font-mono text-sm focus:outline-none flex-1 uppercase"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-bold text-xs cursor-pointer"
            >
              Apply Promo
            </button>
          </form>
        </div>

        {/* Right: Booking Summary & Final Price (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex flex-col gap-4">
            <h3 className="font-title-md text-base font-bold text-white">
              Booking Itinerary Summary
            </h3>

            <div className="p-4 rounded-xl bg-surface-container-high/50 flex flex-col gap-2 text-xs">
              <div className="font-bold text-primary uppercase text-[10px] tracking-wider">
                {bookingDraft?.category || 'FLIGHT'} RESERVATION
              </div>
              <div className="font-bold text-white text-sm">
                {bookingDraft?.itemDetails?.airline || bookingDraft?.itemDetails?.trainName || bookingDraft?.itemDetails?.name || bookingDraft?.itemDetails?.operator}
              </div>
              <div className="text-on-surface-variant">
                {bookingDraft?.itemDetails?.origin} → {bookingDraft?.itemDetails?.destination || bookingDraft?.itemDetails?.city}
              </div>
              <div className="text-[11px] text-secondary mt-1">
                {paxSeat ? `Seat ${paxSeat}` : ''}
              </div>
            </div>

            {/* Price Table */}
            <div className="flex flex-col gap-2 text-xs pt-2">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Base Fare:</span>
                <span className="font-mono text-white">₹{pricing.baseFare}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Taxes & GST (18%):</span>
                <span className="font-mono text-white">₹{pricing.tax}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Platform Handling Fee:</span>
                <span className="font-mono text-white">₹{pricing.platformFee}</span>
              </div>
              {pricing.discount > 0 && (
                <div className="flex items-center justify-between text-secondary font-semibold">
                  <span>Voyager Promo Discount:</span>
                  <span className="font-mono">-₹{pricing.discount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between font-bold text-sm text-white">
                <span>Total Due:</span>
                <span className="text-tertiary font-headline-sm text-xl">
                  ₹{pricing.totalAmount}
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateBooking}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer mt-2"
            >
              <span>{loading ? 'Initiating GDS Lock...' : 'Proceed to Payment Gateway'}</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                lock
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
