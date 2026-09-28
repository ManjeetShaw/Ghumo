import React, { useState } from 'react';
import { bookingApi } from '../api.js';

export default function TicketConfirmationPage({ booking, onBackToDashboard, onNavigateToTrips }) {
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [cancelling, setCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState(null);

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this confirmed reservation? A refund will be initiated.")) {
      return;
    }
    setCancelling(true);
    try {
      const res = await bookingApi.cancelBooking(currentBooking._id, "Travel plans rescheduled by passenger");
      if (res.success && res.data) {
        setCurrentBooking(res.data);
        setCancelStatus("Reservation cancelled. Full refund processing to original payment source.");
      }
    } catch (err) {
      console.error("Cancellation error:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = ['CANCELLED', 'CANCELLATION_PENDING', 'REFUND_PENDING', 'REFUNDED'].includes(currentBooking?.status);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-2xl border border-surface-container-high/60 shadow-lg">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCancelled ? 'bg-error/20 text-error' : 'bg-secondary-container text-secondary'}`}>
            <span className="material-symbols-outlined text-[28px]">
              {isCancelled ? 'cancel' : 'verified'}
            </span>
          </div>
          <div>
            <h1 className="font-headline-sm text-2xl font-bold text-white">
              {isCancelled ? 'Reservation Cancelled & Refund Initiated' : 'Booking Confirmed & Ticket Issued!'}
            </h1>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Booking Reference (PNR):{' '}
              <span className="font-mono text-tertiary font-bold tracking-widest text-sm">
                {currentBooking?.bookingReference}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-variant hover:bg-surface-container-highest text-white text-xs font-bold transition-all cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print E-Ticket</span>
          </button>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container hover:bg-primary text-on-primary-container text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <span>Voyager Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {cancelStatus && (
        <div className="p-4 rounded-xl bg-error/20 border border-error/30 text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base">info</span>
          <span>{cancelStatus}</span>
        </div>
      )}

      {/* Digital Boarding Pass Card */}
      <div className="relative rounded-3xl overflow-hidden bg-surface-container-low border border-surface-container-high/80 shadow-2xl flex flex-col md:flex-row">
        {/* Left Side: Ticket Main */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between gap-6 border-b md:border-b-0 md:border-r border-dashed border-outline-variant/40">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-headline-sm text-xl font-black text-white tracking-tight">Foxico</span>
              <span className="font-label-sm text-[10px] text-tertiary uppercase tracking-widest font-bold">Boarding Pass</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-surface-variant text-secondary text-xs font-bold font-mono">
              {currentBooking?.category || 'FLIGHT'}
            </div>
          </div>

          {/* Route Display */}
          <div className="flex items-center justify-between py-4">
            <div>
              <span className="text-3xl font-black text-white font-mono">
                {currentBooking?.itemDetails?.origin}
              </span>
              <span className="block text-xs text-on-surface-variant mt-0.5">
                {currentBooking?.itemDetails?.originCity}
              </span>
            </div>

            <div className="flex-1 px-6 flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-[28px]">
                {currentBooking?.category === 'TRAIN' ? 'train' : currentBooking?.category === 'BUS' ? 'directions_bus' : currentBooking?.category === 'HOTEL' ? 'hotel' : 'flight'}
              </span>
              <div className="w-full h-0.5 bg-outline-variant my-1" />
              <span className="text-[10px] font-mono text-tertiary">CONFIRMED MANIFEST</span>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-white font-mono">
                {currentBooking?.itemDetails?.destination || currentBooking?.itemDetails?.city}
              </span>
              <span className="block text-xs text-on-surface-variant mt-0.5">
                {currentBooking?.itemDetails?.destinationCity}
              </span>
            </div>
          </div>

          {/* Passenger & Seat Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-high/40 border border-surface-container-high/40 text-xs">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Passenger</span>
              <span className="font-bold text-white text-sm">
                {currentBooking?.passengers?.[0]?.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Seat / Berth</span>
              <span className="font-bold text-primary text-sm font-mono">
                {currentBooking?.passengers?.[0]?.seatNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Service / Flight</span>
              <span className="font-bold text-white text-sm font-mono">
                {currentBooking?.itemDetails?.flightNumber || currentBooking?.itemDetails?.trainNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Gate / Platform</span>
              <span className="font-bold text-tertiary text-sm font-mono">
                Gate 14B
              </span>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2">
            <span>Boarding: 45 Mins prior to departure</span>
            <span className="font-mono text-secondary font-bold">Fast-Track Vault Biometrics</span>
          </div>
        </div>

        {/* Right Side: QR Code & Security Stub */}
        <div className="w-full md:w-64 bg-surface-container/90 p-6 flex flex-col items-center justify-between gap-4 text-center">
          <div className="flex flex-col items-center">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
              Digital E-Manifest
            </span>
            <span className="text-xs font-bold text-white mt-1">Terminal Scanner</span>
          </div>

          {/* Dynamic Mock QR Code */}
          <div className="w-36 h-36 bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=FOXICO-VOYAGE-${currentBooking?.bookingReference}`}
              alt="Boarding QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="w-full">
            <span className="font-mono text-[10px] text-on-surface-variant block tracking-widest uppercase">
              UUID {currentBooking?._id?.slice(0, 12)}
            </span>
            <span className="font-label-sm text-[11px] text-secondary font-bold block mt-1">
              STATUS: {currentBooking?.status || 'TICKET_ISSUED'}
            </span>
          </div>

          {!isCancelled && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="text-[11px] text-outline hover:text-error transition-colors uppercase font-bold mt-2 cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
