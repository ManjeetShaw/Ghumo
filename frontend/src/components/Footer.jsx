import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full bg-surface-container-lowest mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.3)] border-t border-surface-container-high/30">
      <div className="w-full px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-tertiary-container via-tertiary to-primary-container flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-surface-container-lowest text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  travel_explore
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">
                Foxico AI
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm leading-relaxed">
              Intelligent travel orchestration blending bespoke itineraries, high-speed rail, seamless intercity transit, and cinematic luxury stays worldwide.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                Systems Fully Operational (v2.4 Live)
              </span>
            </div>
          </div>

          {/* Exploration */}
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-1">
              Exploration
            </h4>
            <button onClick={() => onNavigate?.('landing')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Destinations & Stays
            </button>
            <button onClick={() => onNavigate?.('ai-planner')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Autonomous AI Planner
            </button>
            <button onClick={() => onNavigate?.('flights')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Private Aviation Hub
            </button>
            <button onClick={() => onNavigate?.('trains')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Scenic Railway Passes
            </button>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-1">
              Platform
            </h4>
            <button onClick={() => onNavigate?.('dashboard')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Voyager Experience
            </button>
            <button onClick={() => onNavigate?.('multimodal')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Global Transit Graph
            </button>
            <button onClick={() => onNavigate?.('health')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              System Health Diagnostics
            </button>
            <button onClick={() => onNavigate?.('trips')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Active Itineraries
            </button>
          </div>

          {/* Concierge */}
          <div className="flex flex-col gap-2">
            <h4 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-1">
              Concierge
            </h4>
            <button onClick={() => onNavigate?.('ai-planner')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              24/7 Global Dispatch
            </button>
            <button onClick={() => onNavigate?.('bookings')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Flight Delay Protection
            </button>
            <button onClick={() => onNavigate?.('bookings')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Trip Cancellation
            </button>
            <button onClick={() => onNavigate?.('dashboard')} className="text-left font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors">
              Privacy & Safety Vault
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low/40 px-6 py-4 rounded-xl border border-surface-container-high/30">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 Foxico AI Travel Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-body-sm text-body-sm text-on-surface-variant">
            <a href="#terms" className="hover:text-on-surface transition-colors">Terms of Expedition</a>
            <a href="#privacy" className="hover:text-on-surface transition-colors">Privacy Policy</a>
            <a href="#security" className="hover:text-on-surface transition-colors">Security Protocols</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
