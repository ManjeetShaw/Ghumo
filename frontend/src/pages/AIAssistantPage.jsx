import React, { useState } from 'react';
import { aiApi, tripApi } from '../api.js';

export default function AIAssistantPage({ onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Itinerary Generator state
  const [dest, setDest] = useState('Jaipur');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(25000);
  const [generating, setGenerating] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setSearching(true);
    try {
      const res = await aiApi.travelSearch(prompt);
      if (res.success && res.data) {
        setSearchResult(res.data);
      }
    } catch (err) {
      console.error('AI search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateItinerary = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setSavedSuccess(false);
    try {
      const res = await aiApi.generateItinerary({
        destination: dest,
        days: Number(days),
        budget: Number(budget),
        title: `${days}-Day Autonomous ${dest} Voyage`
      });
      if (res.success && res.data) {
        setGeneratedTrip(res.data);
      }
    } catch (err) {
      console.error('AI itinerary error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToTrips = async () => {
    if (!generatedTrip) return;
    try {
      // If the user was authenticated when the itinerary was generated, the
      // backend already persisted it as a Trip in the same call (see
      // ai.service.js generateItinerary). Creating another Trip here would
      // just duplicate it, so only fall back to a manual create when that
      // didn't happen (e.g. the itinerary was generated as a guest).
      if (generatedTrip.alreadySaved) {
        setSavedSuccess(true);
        return;
      }

      const formattedItems = [];
      generatedTrip.dailyPlans?.forEach((day) => {
        day.activities?.forEach((act) => {
          formattedItems.push({
            type: 'ACTIVITY',
            title: act.activity,
            date: '2026-11-12',
            startTime: act.time,
            estimatedCost: act.cost,
            notes: act.notes
          });
        });
      });

      const res = await tripApi.createTrip({
        title: generatedTrip.title,
        description: `Autonomous AI generated itinerary for ${generatedTrip.destination}`,
        startDate: '2026-11-12',
        endDate: '2026-11-16',
        destinations: [{ city: generatedTrip.destination, country: 'Global' }],
        budget: generatedTrip.budget
      });

      if (res.success && res.data) {
        for (const itm of formattedItems.slice(0, 4)) {
          await tripApi.addItineraryItem(res.data._id, itm);
        }
        setSavedSuccess(true);
      }
    } catch (err) {
      console.error('Save to trips error:', err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            Autonomous AI Travel Engine
          </div>
          <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface mt-1">
            Foxico AI Concierge & Tour Synthesizer
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Natural language intent extraction, multimodal transit optimization, and day-by-day expedition planner.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full border border-surface-container-high">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="font-label-sm text-xs text-on-surface font-semibold">Gemini AI Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Natural Language Travel Search (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex flex-col gap-4">
            <h2 className="font-title-md text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
              Natural Language Multimodal Search
            </h2>

            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <textarea
                  rows="3"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Find cheap flights from Kolkata to Delhi under 5000 or luxury villa in Bali..."
                  className="w-full bg-surface-container-high px-4 py-3 rounded-xl text-white font-title-md text-sm border border-surface-container-high focus:outline-none placeholder:text-outline-variant resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5 text-xs text-on-surface-variant">
                  {['Kolkata to Delhi under 5000', 'Vande Bharat to Kasaragod', 'Bali Luxury Villa'].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPrompt(p)}
                      className="px-2.5 py-0.5 rounded-full bg-surface-container-high hover:bg-surface-variant text-[11px] text-secondary cursor-pointer"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={searching}
                  className="py-2.5 px-5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {searching ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  )}
                  <span>Synthesize</span>
                </button>
              </div>
            </form>

            {/* Results */}
            {searchResult && (
              <div className="mt-2 p-4 rounded-xl bg-surface-container-high/60 border border-surface-container-high flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Parsed Journey Intent:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-surface-container">
                    <span className="text-on-surface-variant block text-[10px]">Origin:</span>
                    <span className="font-bold text-white">{searchResult.intent?.origin || 'Delhi'}</span>
                  </div>
                  <div className="p-2 rounded bg-surface-container">
                    <span className="text-on-surface-variant block text-[10px]">Destination:</span>
                    <span className="font-bold text-white">{searchResult.intent?.destination || 'Bali'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container-high text-xs">
                  <span className="text-on-surface-variant">Mode: {searchResult.intent?.category}</span>
                  <button
                    onClick={() => onNavigate?.('multimodal')}
                    className="font-bold text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View in Comparison Engine →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Tour & Itinerary Generator (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-xl flex flex-col gap-4">
            <h2 className="font-title-md text-base font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[20px]">route</span>
              AI Tour & Expedition Generator
            </h2>

            <form onSubmit={handleGenerateItinerary} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">Destination</label>
                <input
                  type="text"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
                  placeholder="Jaipur / Bali / Kerala"
                />
              </div>

              <div>
                <label className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">Days</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
                >
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="4">4 Days</option>
                  <option value="5">5 Days</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-surface-container-high px-3 py-2 rounded-xl text-white font-title-md text-xs border border-surface-container-high focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-3 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-title-md text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {generating ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  )}
                  <span>Generate Bespoke Itinerary</span>
                </button>
              </div>
            </form>

            {/* Generated Tour Plan */}
            {generatedTrip && (
              <div className="mt-2 p-4 rounded-xl bg-surface-container-high/60 border border-surface-container-high flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{generatedTrip.title}</h3>
                    <span className="text-xs text-secondary font-mono">{generatedTrip.days} Days • ₹{generatedTrip.budget?.totalBudget} Target Budget</span>
                  </div>
                  <button
                    onClick={handleSaveToTrips}
                    className="px-3.5 py-1.5 rounded-full bg-secondary-container text-secondary text-xs font-bold hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    <span>Save to My Trips</span>
                  </button>
                </div>

                {savedSuccess && (
                  <div className="p-2 rounded bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Successfully synced to your Trips Dashboard!</span>
                  </div>
                )}

                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto no-scrollbar pt-1">
                  {generatedTrip.dailyPlans?.map((dp) => (
                    <div key={dp.day} className="p-3 rounded-lg bg-surface-container text-xs flex flex-col gap-1.5">
                      <span className="font-bold text-primary">{dp.title}</span>
                      {dp.activities?.map((act, i) => (
                        <div key={i} className="flex items-start justify-between text-on-surface-variant gap-2 pl-2 border-l border-surface-variant">
                          <div>
                            <span className="font-mono text-white text-[11px] font-bold">{act.time}: </span>
                            <span>{act.activity}</span>
                          </div>
                          <span className="font-mono text-tertiary font-bold shrink-0">₹{act.cost}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
