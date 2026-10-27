import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import { SITE } from '../config/site.js';

const NAV_ITEMS = [
  { id: 'landing', label: 'Destinations' },
  { id: 'flights', label: 'Flights' },
  { id: 'trains', label: 'Trains' },
  { id: 'buses', label: 'Buses' },
  { id: 'hotels', label: 'Hotels' },
  { id: 'multimodal', label: 'Compare' },
  { id: 'ai-planner', label: 'Trip planner' },
  { id: 'trips', label: 'My trips' },
  { id: 'bookings', label: 'Bookings' },
];

export default function Navbar({ activePage, onNavigate, onOpenSearch, unreadCount = 0, onToggleNotifications }) {
  const { user, isAuthenticated } = useAuth();
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-surface-container-high">
      <div className="h-16 w-full px-4 lg:px-8 flex items-center justify-between gap-4">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5 shrink-0" aria-label={`${SITE.name} home`}>
          <Logo size={30} />
          <span className="text-xl font-extrabold tracking-tight text-on-surface">{SITE.name}</span>
        </button>

        <nav className="hidden xl:flex items-center gap-1" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activePage === item.id
                  ? 'bg-surface-variant text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 bg-surface-container-high hover:bg-surface-variant px-3 py-1.5 rounded-md text-on-surface-variant text-sm border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search</span>
            <kbd className="bg-surface-variant px-1.5 py-0.5 rounded text-[10px] border border-outline-variant/30">Ctrl K</kbd>
          </button>

          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/20"
            type="button"
            aria-label="Search"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={onToggleNotifications}
              className="relative p-2 rounded-md bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/20"
              type="button"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded bg-tertiary text-on-tertiary text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-md border text-sm ${
                activePage === 'dashboard'
                  ? 'bg-surface-variant border-primary/50 text-primary'
                  : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
              }`}
            >
              <span className="w-7 h-7 rounded bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
                {initial}
              </span>
              <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 rounded-md bg-primary-container text-on-primary-container hover:bg-primary text-sm font-bold"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      <nav className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-surface-container-low border-t border-surface-container-high no-scrollbar" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold ${
              activePage === item.id ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
