import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingApi, searchApi } from '../api.js';
import { describeBooking } from '../utils/bookingStatus.js';
import { formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, secondaryButton, ErrorNote } from '../components/ui.jsx';

export default function CheckoutPage({ bookingDraft, onBookingSuccess, onCancel }) {
  const { user } = useAuth();

  const [paxName, setPaxName] = useState(user?.name || '');
  const [paxAge, setPaxAge] = useState('');
  const [paxGender, setPaxGender] = useState('FEMALE');
  const [idProof, setIdProof] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(true);
  const [promoMessage, setPromoMessage] = useState(null); // { type, text }
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const category = bookingDraft?.category || 'FLIGHT';
  const draftBase = bookingDraft?.pricing?.baseFare;

  async function fetchQuote(code) {
    const res = await searchApi.getPriceQuote({ category, baseFare: draftBase, passengers: 1, promoCode: code });
    return res;
  }

  // The price shown here always comes from the server.
  useEffect(() => {
    let cancelled = false;
    setQuoting(true);
    fetchQuote('')
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setQuote(res.data);
        else setErrorMsg(res.error?.message || 'Could not calculate the price. Please go back and try again.');
      })
      .catch(() => !cancelled && setErrorMsg('Could not calculate the price. Please go back and try again.'))
      .finally(() => !cancelled && setQuoting(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!bookingDraft || draftBase === undefined) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-sm text-on-surface-variant">
        Nothing to check out. <button onClick={onCancel} className="text-primary underline">Start a search</button>
      </div>
    );
  }

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setPromoMessage(null);
    const code = promoCode.trim();
    if (!code) return;
    try {
      const res = await fetchQuote(code);
      if (res.success && res.data) {
        if (res.data.discount > 0) {
          setQuote(res.data);
          setAppliedPromo(code);
          setPromoMessage({ type: 'ok', text: `${code} applied.` });
        } else {
          setPromoMessage({ type: 'error', text: 'This code does not apply to this booking.' });
        }
      } else {
        setPromoMessage({ type: 'error', text: res.error?.message || 'This code is not valid.' });
      }
    } catch (err) {
      setPromoMessage({ type: 'error', text: 'Could not check the code. Please try again.' });
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!quote) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await bookingApi.createBooking({
        category,
        vendorItemId: bookingDraft.vendorItemId,
        itemDetails: bookingDraft.itemDetails || {},
        promoCode: appliedPromo || undefined,
        passengers: [{ name: paxName.trim(), age: Number(paxAge), gender: paxGender, idProof: idProof.trim() }],
        pricing: { baseFare: quote.baseFare, currency: 'INR' },
      });
      if (res.success && res.data) onBookingSuccess?.(res.data);
      else setErrorMsg(res.error?.message || 'Could not create the booking.');
    } catch (err) {
      setErrorMsg(err.message || 'Could not create the booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const info = describeBooking({ category, itemDetails: bookingDraft.itemDetails });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 border-b border-surface-container-high pb-4">
        <h1 className="text-2xl font-extrabold text-on-surface">Checkout</h1>
        <button onClick={onCancel} className={secondaryButton}>Cancel</button>
      </div>

      <ErrorNote>{errorMsg}</ErrorNote>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form id="checkout-form" onSubmit={handleCreateBooking} className="md:col-span-7 flex flex-col gap-5">
          <section className="p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-4">
            <h2 className="text-base font-bold text-on-surface">Traveller</h2>
            <div>
              <label htmlFor="c-name" className={labelClass}>Full name as on ID</label>
              <input id="c-name" required value={paxName} onChange={(e) => setPaxName(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="c-age" className={labelClass}>Age</label>
                <input id="c-age" type="number" min="1" max="120" required value={paxAge} onChange={(e) => setPaxAge(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="c-gender" className={labelClass}>Gender</label>
                <select id="c-gender" value={paxGender} onChange={(e) => setPaxGender(e.target.value)} className={inputClass}>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="c-id" className={labelClass}>ID proof number (optional)</label>
              <input id="c-id" value={idProof} onChange={(e) => setIdProof(e.target.value)} autoComplete="off" className={inputClass} />
              <p className="text-xs text-on-surface-variant mt-1">Carry a valid photo ID. Airlines, railways and hotels check it at travel or check in.</p>
            </div>
          </section>
        </form>

        <div className="md:col-span-5 flex flex-col gap-5">
          <section className="p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-3">
            <h2 className="text-base font-bold text-on-surface">Summary</h2>
            <div className="p-3 rounded-md bg-surface-container-high/60">
              <div className="text-sm font-bold text-on-surface">{info.title}</div>
              <div className="text-xs text-on-surface-variant">{info.route}</div>
            </div>

            <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
              <label htmlFor="c-promo" className="sr-only">Promo code</label>
              <input id="c-promo" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="Promo code" className={`${inputClass} font-mono uppercase`} />
              <button type="submit" className={secondaryButton}>Apply</button>
            </form>
            {promoMessage && <p role="status" className={`text-xs font-semibold ${promoMessage.type === 'ok' ? 'text-secondary' : 'text-error'}`}>{promoMessage.text}</p>}

            {quoting || !quote ? (
              <p className="text-sm text-on-surface-variant py-4">Calculating price</p>
            ) : (
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-on-surface-variant">Base fare</dt><dd className="text-on-surface">{formatINR(quote.baseFare)}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Taxes</dt><dd className="text-on-surface">{formatINR(quote.gstTax)}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Service fee</dt><dd className="text-on-surface">{formatINR(quote.platformFee)}</dd></div>
                {quote.discount > 0 && <div className="flex justify-between text-secondary"><dt>Discount</dt><dd>-{formatINR(quote.discount)}</dd></div>}
                <div className="flex justify-between pt-3 mt-1 border-t border-surface-container-high text-base font-bold">
                  <dt className="text-on-surface">Total</dt><dd className="text-on-surface">{formatINR(quote.finalAmount)}</dd>
                </div>
              </dl>
            )}

            <button type="submit" form="checkout-form" disabled={loading || quoting || !quote} className={`${primaryButton} w-full mt-1 py-3`}>
              {loading ? 'Creating booking' : 'Continue to payment'}
            </button>
            <p className="text-xs text-on-surface-variant">
              By continuing you agree to the Terms and Conditions. Your booking is confirmed only after payment succeeds.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
