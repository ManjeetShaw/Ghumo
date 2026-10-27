import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { notificationApi, bookingApi } from './api.js';
import { SITE } from './config/site.js';
import { isUnpaid } from './utils/bookingStatus.js';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import NotificationDrawer from './components/NotificationDrawer.jsx';
import GlobalSearchModal from './components/GlobalSearchModal.jsx';

import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FlightSearchPage from './pages/FlightSearchPage.jsx';
import TrainSearchPage from './pages/TrainSearchPage.jsx';
import BusSearchPage from './pages/BusSearchPage.jsx';
import HotelsPage from './pages/HotelsPage.jsx';
import MultimodalComparePage from './pages/MultimodalComparePage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import TicketConfirmationPage from './pages/TicketConfirmationPage.jsx';
import TripDashboardPage from './pages/TripDashboardPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import AIAssistantPage from './pages/AIAssistantPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';

// Page id to URL path. Pages that depend on in-memory state (checkout, payment, ticket)
// have no path of their own: the address bar keeps the previous page's path.
const PATHS = {
  landing: '/',
  flights: '/flights',
  trains: '/trains',
  buses: '/buses',
  hotels: '/hotels',
  multimodal: '/compare',
  'ai-planner': '/planner',
  trips: '/trips',
  bookings: '/bookings',
  dashboard: '/account',
  auth: '/signin',
  privacy: '/privacy',
  terms: '/terms',
};
const PAGE_BY_PATH = Object.fromEntries(Object.entries(PATHS).map(([page, path]) => [path, page]));

const TITLES = {
  landing: 'Book flights, trains, buses and hotels in India',
  flights: 'Flights',
  trains: 'Trains',
  buses: 'Buses',
  hotels: 'Hotels',
  multimodal: 'Compare travel options',
  'ai-planner': 'Trip planner',
  trips: 'My trips',
  bookings: 'My bookings',
  dashboard: 'Account',
  auth: 'Sign in',
  privacy: 'Privacy Policy',
  terms: 'Terms and Conditions',
  checkout: 'Checkout',
  payment: 'Payment',
  ticket: 'Your ticket',
  notfound: 'Page not found',
};

// Pages that need a signed-in user.
const PROTECTED = new Set(['trips', 'bookings', 'dashboard', 'checkout', 'payment', 'ticket']);

function pageFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return PAGE_BY_PATH[path] || 'notfound';
}

function NotFound({ onNavigate }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center flex flex-col items-center gap-3">
      <h1 className="text-2xl font-bold text-on-surface">Page not found</h1>
      <p className="text-sm text-on-surface-variant">The page you are looking for does not exist.</p>
      <button onClick={() => onNavigate('landing')} className="mt-2 px-5 py-2.5 rounded-md bg-primary-container text-on-primary-container text-sm font-bold">
        Go to home page
      </button>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  const [activePage, setActivePage] = useState(pageFromLocation);
  const [pageParams, setPageParams] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Booking flow state
  const [bookingDraft, setBookingDraft] = useState(null);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState(null);

  const navigate = useCallback((page, params = null) => {
    setPageParams(params);
    setActivePage(page);
    const path = PATHS[page];
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo(0, 0);
  }, []);

  // Browser back and forward buttons
  useEffect(() => {
    const onPop = () => {
      setPageParams(null);
      setActivePage(pageFromLocation());
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Pages that need a signed-in user show the sign in page until the user signs in.
  const gated = PROTECTED.has(activePage) && !isAuthenticated;
  const view = gated ? 'auth' : activePage;

  useEffect(() => {
    document.title = view === 'landing' ? `${SITE.name} | ${TITLES.landing}` : `${TITLES[view] || SITE.name} | ${SITE.name}`;
  }, [view]);

  // Ctrl+K or Cmd+K opens search, Escape closes it.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((open) => !open);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Unread notification count, only while signed in.
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return undefined;
    }
    let cancelled = false;
    async function loadNotifMeta() {
      try {
        const res = await notificationApi.getNotifications();
        if (!cancelled && res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // The next poll will try again.
      }
    }
    loadNotifMeta();
    const interval = setInterval(loadNotifMeta, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleProceedToCheckout = (draft) => {
    setBookingDraft(draft);
    navigate('checkout');
  };

  const handleBookingSuccess = (newBooking) => {
    setBookingDraft(null);
    setActiveConfirmedBooking(newBooking);
    navigate('payment');
  };

  const handlePaymentSuccess = (confirmedBooking) => {
    setActiveConfirmedBooking(confirmedBooking);
    navigate('ticket');
  };

  const handleSelectBookingById = async (id) => {
    try {
      const res = await bookingApi.getBookingById(id);
      if (res.success && res.data) {
        setActiveConfirmedBooking(res.data);
        navigate(isUnpaid(res.data.status) ? 'payment' : 'ticket');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // A search result opens the matching page, prefilled, so the user sees full options and fares.
  const handleGlobalSearchResult = (type, item, intent) => {
    const date = intent?.date || undefined;
    if (type === 'flights') navigate('flights', { origin: item.origin, destination: item.destination, date });
    else if (type === 'trains') navigate('trains', { origin: item.origin, destination: item.destination, date });
    else if (type === 'buses') navigate('buses', { origin: item.originCity, destination: item.destinationCity, date });
    else if (type === 'hotels') navigate('hotels', { city: item.city });
  };

  // Used by the landing page, popular routes and destination cards.
  const handleSearch = (page, params) => navigate(page, params);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <Navbar
        activePage={view}
        onNavigate={navigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        unreadCount={unreadCount}
        onToggleNotifications={() => setNotifDrawerOpen((open) => !open)}
      />

      <main className="w-full pt-28 xl:pt-16 flex-1">
        {view === 'landing' && <LandingPage onSearch={handleSearch} />}

        {view === 'auth' && (
          <AuthPage
            notice={gated ? 'Please sign in to continue.' : ''}
            onSuccess={() => navigate(gated ? activePage : 'landing')}
            onNavigate={navigate}
          />
        )}

        {view === 'dashboard' && <DashboardPage onNavigate={navigate} onSelectBooking={handleSelectBookingById} />}
        {view === 'flights' && <FlightSearchPage key={JSON.stringify(pageParams)} initial={pageParams} onProceedToCheckout={handleProceedToCheckout} />}
        {view === 'trains' && <TrainSearchPage key={JSON.stringify(pageParams)} initial={pageParams} onProceedToCheckout={handleProceedToCheckout} />}
        {view === 'buses' && <BusSearchPage key={JSON.stringify(pageParams)} initial={pageParams} onProceedToCheckout={handleProceedToCheckout} />}
        {view === 'hotels' && <HotelsPage key={JSON.stringify(pageParams)} initial={pageParams} onProceedToCheckout={handleProceedToCheckout} />}
        {view === 'multimodal' && <MultimodalComparePage onNavigate={navigate} />}

        {view === 'checkout' && (
          <CheckoutPage bookingDraft={bookingDraft} onBookingSuccess={handleBookingSuccess} onCancel={() => navigate('landing')} />
        )}
        {view === 'payment' && (
          <PaymentPage booking={activeConfirmedBooking} onPaymentSuccess={handlePaymentSuccess} onCancel={() => navigate('bookings')} />
        )}
        {view === 'ticket' && (
          <TicketConfirmationPage booking={activeConfirmedBooking} onBackToBookings={() => navigate('bookings')} />
        )}

        {view === 'trips' && <TripDashboardPage onNavigate={navigate} />}
        {view === 'bookings' && <MyBookingsPage onSelectBooking={handleSelectBookingById} onNavigate={navigate} />}
        {view === 'ai-planner' && <AIAssistantPage onNavigate={navigate} />}
        {view === 'privacy' && <PrivacyPage />}
        {view === 'terms' && <TermsPage />}
        {view === 'notfound' && <NotFound onNavigate={navigate} />}
      </main>

      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onNotificationClick={() => {
          setNotifDrawerOpen(false);
          navigate('bookings');
        }}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectResult={handleGlobalSearchResult}
      />

      {view !== 'auth' && <Footer onNavigate={navigate} />}
    </div>
  );
}
