import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ activePage, setActivePage, onOpenSearch, unreadCount = 0, onToggleNotifications }) {
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { id: 'landing', label: 'Destinations' },
    { id: 'flights', label: 'Flights' },
    { id: 'trains', label: 'Trains' },
    { id: 'buses', label: 'Buses' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'multimodal', label: 'Compare' },
    { id: 'ai-planner', label: 'AI Planner' },
    { id: 'trips', label: 'My Trips' },
    { id: 'bookings', label: 'Bookings' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/75 backdrop-blur-2xl shadow-[0_1px_8px_rgba(0,0,0,0.35)] border-b border-surface-container-high/40">
      <div className="h-20 w-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-tertiary-container via-tertiary to-primary-container flex items-center justify-center shadow-lg shadow-tertiary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-surface-container-lowest text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                travel_explore
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-[20px] font-extrabold tracking-tight text-on-surface group-hover:text-primary transition-colors">
                Foxico
              </span>
              <span className="font-label-sm text-[10px] text-tertiary -mt-1 tracking-widest uppercase font-bold">
                AI Voyage
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Nav Rail */}
        <nav className="hidden xl:flex items-center bg-surface-container-low/80 px-1 py-1 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.3)] border border-surface-container-high/60">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-3.5 py-1.5 rounded-full font-label-md text-[13px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-surface-variant text-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & User Controls */}
        <div className="flex items-center gap-2.5">
          {/* Search Voyages Trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 bg-surface-container-high/60 hover:bg-surface-container-highest px-3.5 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span className="font-body-sm text-[12px]">Search voyages...</span>
            <kbd className="bg-surface-variant px-1.5 py-0.5 rounded text-[10px] font-counter-display text-on-surface-variant font-bold border border-outline-variant/30">
              ⌘K
            </kbd>
          </button>

          {/* Currency / Language Pill */}
          <div className="hidden sm:flex items-center bg-surface-container-high/60 px-3 py-1.5 rounded-full text-on-surface-variant border border-outline-variant/20">
            <span className="font-label-sm text-[11px] px-1 text-tertiary font-bold">INR ₹</span>
            <span className="text-outline-variant">|</span>
            <span className="font-label-sm text-[11px] px-1 text-on-surface">EN</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-full bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all border border-outline-variant/20"
            type="button"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-tertiary ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {/* Health Diagnostics Trigger */}
          <button
            onClick={() => setActivePage('health')}
            className={`p-2 rounded-full bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface transition-all border border-outline-variant/20 ${activePage === 'health' ? 'text-primary border-primary/40' : ''}`}
            title="System Health & GDS Status"
          >
            <span className="material-symbols-outlined text-[20px]">monitor_heart</span>
          </button>

          {/* User Profile Avatar / Sign In */}
          {isAuthenticated ? (
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-all border ${
                activePage === 'dashboard'
                  ? 'bg-surface-variant border-primary/50 text-primary'
                  : 'bg-surface-container-low/80 hover:bg-surface-variant border-outline-variant/30'
              }`}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzrMVEImN0HrmcGiTCzLpzxB_bDWwS0E-2MpQNIklTg2guq87NVEXczngCT1A7zClykQFxSaGOY7w2Ta5cP4k7QcdbX2MzCLCiZ8ivrlFSZJ0xAPzi0RILt54PQ79dFEHiBsD-GZy9PJFeOPGqYWlupDeVlIyGIYsUCawG6dF1Pa5c8tJ9xcFl2BGxghkK5-g9zT41x_iyMg-FJLl3FTUbOun8WQMwpJ3OKT9NaAQ6xQfYuAgXt5Wr"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/40"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-body-sm text-[11px] text-on-surface-variant leading-none">Hello,</span>
                <span className="font-title-md text-[13px] text-on-surface font-semibold leading-none mt-0.5">
                  {user?.name?.split(' ')[0] || 'Anney'}!
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('auth')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary-container hover:bg-primary font-title-md text-[13px] font-bold shadow-md transition-all"
            >
              <span>Sign In</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Submenu Navigation Bar */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-surface-container-low/95 border-t border-surface-container-high/40 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold ${
              activePage === item.id
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
