import React from 'react';
import Logo from './Logo.jsx';
import { SITE } from '../config/site.js';

function FooterLink({ onClick, children }) {
  return (
    <button onClick={onClick} className="text-left text-sm text-on-surface-variant hover:text-primary transition-colors">
      {children}
    </button>
  );
}

export default function Footer({ onNavigate }) {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-surface-container-high">
      <div className="w-full px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="text-lg font-extrabold text-on-surface">{SITE.name}</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
              Search and book flights, trains, buses and hotels for travel within India.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs text-on-surface font-bold uppercase tracking-wider mb-1">Book</h4>
            <FooterLink onClick={() => onNavigate('flights')}>Flights</FooterLink>
            <FooterLink onClick={() => onNavigate('trains')}>Trains</FooterLink>
            <FooterLink onClick={() => onNavigate('buses')}>Buses</FooterLink>
            <FooterLink onClick={() => onNavigate('hotels')}>Hotels</FooterLink>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-xs text-on-surface font-bold uppercase tracking-wider mb-1">Account and legal</h4>
            <FooterLink onClick={() => onNavigate('bookings')}>My bookings</FooterLink>
            <FooterLink onClick={() => onNavigate('trips')}>My trips</FooterLink>
            <FooterLink onClick={() => onNavigate('privacy')}>Privacy Policy</FooterLink>
            <FooterLink onClick={() => onNavigate('terms')}>Terms and Conditions</FooterLink>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-surface-container-high text-xs text-on-surface-variant">
          © {new Date().getFullYear()} {SITE.legalName || SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
