import React, { useState } from 'react';
import { aiApi } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PLACES } from '../data/places.js';
import { formatINR } from '../utils/date.js';
import { inputClass, labelClass, primaryButton, secondaryButton, PageHeader, ErrorNote } from '../components/ui.jsx';

export default function AIAssistantPage({ onNavigate }) {
  const { isAuthenticated } = useAuth();

  const [dest, setDest] = useState('Jaipur');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(25000);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    try {
      const res = await aiApi.generateItinerary({
        destination: dest.trim(),
        days: Number(days),
        budget: Number(budget),
        title: `${days} days in ${dest.trim()}`,
      });
      if (res.success && res.data) setPlan(res.data);
      else setError(res.error?.message || 'Could not create the plan. Please try again.');
    } catch (err) {
      setError('Could not create the plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-6">
      <PageHeader title="Trip planner" subtitle="Get a day by day plan for a place in India, with estimated costs in rupees." />
      <datalist id="plan-cities">{PLACES.map((p) => <option key={p.city} value={p.city} />)}</datalist>

      <form onSubmit={handleGenerate} className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div className="sm:col-span-1">
          <label htmlFor="p-dest" className={labelClass}>Destination</label>
          <input id="p-dest" list="plan-cities" required value={dest} onChange={(e) => setDest(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="p-days" className={labelClass}>Days</label>
          <input id="p-days" type="number" min="1" max="14" required value={days} onChange={(e) => setDays(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="p-budget" className={labelClass}>Budget (₹)</label>
          <input id="p-budget" type="number" min="1000" required value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={generating} className={primaryButton}>{generating ? 'Planning' : 'Create plan'}</button>
      </form>

      <p className="text-xs text-on-surface-variant">
        Plans are written by an AI model and can contain mistakes. Check timings, prices and entry rules before you travel.
      </p>

      <ErrorNote>{error}</ErrorNote>

      {plan && (
        <section className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-on-surface">{plan.title}</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                {plan.daysCount} days in {plan.destination}. Estimated total {formatINR(plan.estimatedTotal)} against a budget of {formatINR(plan.budgetLimit)}.
              </p>
            </div>
            {plan.alreadySaved ? (
              <button onClick={() => onNavigate('trips')} className={secondaryButton}>Open in My trips</button>
            ) : isAuthenticated ? null : (
              <button onClick={() => onNavigate('auth')} className={secondaryButton}>Sign in to save this plan</button>
            )}
          </div>

          <ol className="flex flex-col gap-4">
            {plan.dailyPlans.map((day) => (
              <li key={day.day} className="p-5 rounded-lg bg-surface-container-low border border-surface-container-high flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-on-surface">Day {day.day}: {day.title}</h3>
                  <span className="text-sm text-on-surface-variant">{formatINR(day.estimatedCost)}</span>
                </div>
                <ul className="flex flex-col divide-y divide-surface-container-high">
                  {day.activities.map((a, i) => (
                    <li key={i} className="py-2.5 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm text-on-surface"><span className="text-on-surface-variant mr-2">{a.time}</span>{a.activity}</div>
                        {a.notes && <div className="text-xs text-on-surface-variant mt-0.5">{a.notes}</div>}
                      </div>
                      <span className="text-sm text-on-surface shrink-0">{formatINR(a.cost || 0)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => onNavigate('hotels', { city: plan.destination })} className={secondaryButton}>Find hotels in {plan.destination}</button>
            <button onClick={() => onNavigate('flights')} className={secondaryButton}>Search flights</button>
          </div>
        </section>
      )}
    </div>
  );
}
