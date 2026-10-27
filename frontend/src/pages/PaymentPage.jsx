import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { paymentApi, bookingApi } from '../api.js';
import { SITE } from '../config/site.js';
import { formatINR } from '../utils/date.js';
import { primaryButton, ErrorNote } from '../components/ui.jsx';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing || document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'));
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
    if (!booking?._id) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    // The amount is computed on the server from the booking. Only the id is sent.
    paymentApi
      .createOrder({ bookingId: booking._id })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setOrder(res.data);
        else setErrorMsg(res.error?.message || 'Could not start the payment.');
      })
      .catch((err) => !cancelled && setErrorMsg(err.message || 'Could not start the payment.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [booking]);

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-sm text-on-surface-variant">
        No booking to pay for. <button onClick={onCancel} className="text-primary underline">Go to My bookings</button>
      </div>
    );
  }

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
        name: SITE.name,
        description: `Booking ${order.bookingReference}`,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#0ea5e9' },
        modal: { ondismiss: () => setProcessing(false) },
        handler: async (response) => {
          try {
            // The server checks the signature, marks the payment as paid and confirms the booking.
            const verifyRes = await paymentApi.verify({
              gatewayOrderId: response.razorpay_order_id,
              gatewayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (!verifyRes.success) {
              throw new Error(verifyRes.error?.message || 'We could not verify the payment.');
            }
            const bookingRes = await bookingApi.getBookingById(booking._id);
            onPaymentSuccess?.(bookingRes.success && bookingRes.data ? bookingRes.data : booking);
          } catch (err) {
            setErrorMsg(`${err.message || 'We could not verify the payment.'} If money was deducted, check My bookings before paying again.`);
            setProcessing(false);
          }
        },
      });

      rzp.on('payment.failed', (resp) => {
        setErrorMsg(resp?.error?.description || 'The payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || 'Could not start the payment.');
      setProcessing(false);
    }
  };

  if (loading) {
    return <p className="py-24 text-center text-sm text-on-surface-variant" role="status">Preparing your payment</p>;
  }

  const total = booking.pricing?.totalAmount;

  return (
    <div className="w-full max-w-xl mx-auto px-4 lg:px-8 py-8">
      <div className="p-6 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 border-b border-surface-container-high pb-4">
          <div>
            <h1 className="text-xl font-bold text-on-surface">Payment</h1>
            <p className="text-sm text-on-surface-variant mt-1">Booking <span className="font-mono text-tertiary">{booking.bookingReference}</span></p>
          </div>
          <div className="text-right">
            <span className="text-xs text-on-surface-variant block">Total payable</span>
            <span className="text-2xl font-extrabold text-on-surface">{formatINR(total)}</span>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant">
          You will choose how to pay in the Razorpay window. Card, UPI and bank details are entered there and never reach our servers.
        </p>

        <ErrorNote>{errorMsg}</ErrorNote>

        <button onClick={handlePayNow} disabled={processing || !order} className={`${primaryButton} w-full py-3`}>
          {processing ? 'Waiting for payment' : `Pay ${formatINR(total)}`}
        </button>

        <button onClick={onCancel} className="text-sm text-on-surface-variant hover:text-on-surface self-start">
          Pay later from My bookings
        </button>
      </div>
    </div>
  );
}
