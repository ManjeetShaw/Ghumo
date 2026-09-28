import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { paymentApi, bookingApi } from '../api.js';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing || document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
    if (!existing) document.body.appendChild(script);
  });
}

export default function PaymentPage({ booking, onPaymentSuccess, onCancel }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function initOrder() {
      try {
        // The amount is computed server-side from the booking; only the id is sent.
        const res = await paymentApi.createOrder({ bookingId: booking._id });
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setErrorMsg(res.error?.message || 'Could not create the payment order.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Could not create the payment order.');
      } finally {
        setLoading(false);
      }
    }
    initOrder();
  }, [booking]);

  const handlePayNow = async () => {
    if (!order) return;
    setErrorMsg('');
    setProcessing(true);
    try {
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: order.gatewayKey,
        order_id: order.gatewayOrderId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: 'Foxico',
        description: `Booking ${order.bookingReference}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#4f8cff' },
        modal: { ondismiss: () => setProcessing(false) },
        handler: async (response) => {
          try {
            // Server verifies the signature, marks the payment paid and confirms the booking.
            const verifyRes = await paymentApi.verify({
              gatewayOrderId: response.razorpay_order_id,
              gatewayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            if (!verifyRes.success) {
              throw new Error(verifyRes.error?.message || 'Payment verification failed');
            }
            const bookingRes = await bookingApi.getBookingById(booking._id);
            onPaymentSuccess?.(bookingRes.success && bookingRes.data ? bookingRes.data : booking);
          } catch (err) {
            setErrorMsg(err.message || 'Payment verification failed');
            setProcessing(false);
          }
        }
      });

      rzp.on('payment.failed', (resp) => {
        setErrorMsg(resp?.error?.description || 'Payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || 'Unable to start payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant gap-3">
        <span className="material-symbols-outlined text-[36px] animate-spin text-primary">sync</span>
        <span className="font-body-md text-sm font-semibold">Creating secure payment order...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-white">Secure Payment</h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Booking: <span className="font-mono text-secondary">{booking.bookingReference}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Total Payable</span>
            <span className="font-headline-sm text-2xl font-bold text-tertiary">₹{booking.pricing.totalAmount}</span>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant">
          You'll choose UPI, card, net banking or wallet in the secure Razorpay window. We never see your payment details.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error/20 border border-error/40 text-error text-xs">{errorMsg}</div>
        )}

        <button
          onClick={handlePayNow}
          disabled={processing || !order}
          className="w-full py-3.5 px-6 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-title-md text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {processing ? 'Waiting for payment...' : `Pay ₹${booking.pricing.totalAmount}`}
        </button>

        <button onClick={onCancel} className="text-xs text-on-surface-variant hover:text-white cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
}
