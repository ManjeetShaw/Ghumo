import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { notificationApi, bookingApi } from './api.js';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import NotificationDrawer from './components/NotificationDrawer.jsx';
import GlobalSearchModal from './components/GlobalSearchModal.jsx';
import AIAssistantWidget from './components/AIAssistantWidget.jsx';

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
import HealthPage from './pages/HealthPage.jsx';

export default function App() {
  const { isAuthenticated, user } = useAuth();

  const [activePage, setActivePage] = useState('landing');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  // Booking Flow State
  const [bookingDraft, setBookingDraft] = useState(null);
  const [activeConfirmedBooking, setActiveConfirmedBooking] = useState(null);

  // Load notifications unread count
  useEffect(() => {
    async function loadNotifMeta() {
      try {
        const res = await notificationApi.getNotifications();
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // ignore
      }
    }
    loadNotifMeta();
    const interval = setInterval(loadNotifMeta, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleProceedToCheckout = (draft) => {
    setBookingDraft(draft);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (newBooking) => {
    setBookingDraft(null);
    setActiveConfirmedBooking(newBooking);
    setActivePage('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (confirmedBooking) => {
    setActiveConfirmedBooking(confirmedBooking);
    setActivePage('ticket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBookingById = async (id) => {
    try {
      const res = await bookingApi.getBookingById(id);
      if (res.success && res.data) {
        setActiveConfirmedBooking(res.data);
        setActivePage('ticket');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGlobalSearchResult = (type, item) => {
    if (type === 'flights') {
      handleProceedToCheckout({
        category: 'FLIGHT',
        vendorItemId: item.id,
        itemDetails: item,
        passengers: [{ name: user?.name || '' }],
        pricing: {
          baseFare: item.price.baseFare,
          tax: item.price.tax,
          platformFee: 0,
          discount: 0,
          totalAmount: item.price.total,
          currency: 'INR'
        }
      });
    } else if (type === 'trains') {
      setActivePage('trains');
    } else if (type === 'hotels') {
      setActivePage('hotels');
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setSearchModalOpen(true)}
        unreadCount={unreadCount}
        onToggleNotifications={() => setNotifDrawerOpen(!notifDrawerOpen)}
      />

      {/* Main Content View */}
      <main className="w-full pt-20 flex-1">
        {activePage === 'landing' && (
          <LandingPage
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onQuickSearch={() => setSearchModalOpen(true)}
          />
        )}

        {activePage === 'auth' && (
          <AuthPage
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectBooking={handleSelectBookingById}
          />
        )}

        {activePage === 'flights' && (
          <FlightSearchPage onProceedToCheckout={handleProceedToCheckout} />
        )}

        {activePage === 'trains' && (
          <TrainSearchPage onProceedToCheckout={handleProceedToCheckout} />
        )}

        {activePage === 'buses' && (
          <BusSearchPage onProceedToCheckout={handleProceedToCheckout} />
        )}

        {activePage === 'hotels' && (
          <HotelsPage onProceedToCheckout={handleProceedToCheckout} />
        )}

        {activePage === 'multimodal' && (
          <MultimodalComparePage
            onProceedToCheckout={handleProceedToCheckout}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'checkout' && (
          <CheckoutPage
            bookingDraft={bookingDraft}
            onBookingSuccess={handleBookingSuccess}
            onCancel={() => setActivePage('landing')}
          />
        )}

        {activePage === 'payment' && (
          <PaymentPage
            booking={activeConfirmedBooking}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setActivePage('dashboard')}
          />
        )}

        {activePage === 'ticket' && (
          <TicketConfirmationPage
            booking={activeConfirmedBooking}
            onBackToDashboard={() => setActivePage('dashboard')}
            onNavigateToTrips={() => setActivePage('trips')}
          />
        )}

        {activePage === 'trips' && (
          <TripDashboardPage
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'bookings' && (
          <MyBookingsPage
            onSelectBooking={handleSelectBookingById}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'ai-planner' && (
          <AIAssistantPage
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'health' && <HealthPage />}
      </main>

      {/* Floating Notification Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onNotificationClick={(notif) => {
          setNotifDrawerOpen(false);
          if (notif.type === 'BOOKING_CONFIRMED' || notif.type === 'BOOKING_PENDING') {
            setActivePage('bookings');
          } else if (notif.type === 'AI_SUGGESTION') {
            setActivePage('trains');
          }
        }}
      />

      {/* Global ⌘K Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectResult={handleGlobalSearchResult}
      />

      {/* Persistent AI Assistant Widget */}
      <AIAssistantWidget
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Footer (shown on all pages except auth page) */}
      {activePage !== 'auth' && (
        <Footer
          onNavigate={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
