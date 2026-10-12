import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { LocationProvider } from './context/LocationContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { BookingModal } from './components/BookingModal.jsx';
import { PaymentModal } from './components/PaymentModal.jsx';
import { ChatDrawer } from './components/ChatDrawer.jsx';
import { ReviewModal } from './components/ReviewModal.jsx';
import { ComplaintModal } from './components/ComplaintModal.jsx';
import { CompareModal } from './components/CompareModal.jsx';
import { AiAssistantModal } from './components/AiAssistantModal.jsx';

import { HomePage } from './pages/HomePage.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { ProvidersPage } from './pages/ProvidersPage.jsx';
import { ProviderDetailPage } from './pages/ProviderDetailPage.jsx';
import { CustomerDashboard } from './pages/CustomerDashboard.jsx';
import { ProviderDashboard } from './pages/ProviderDashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { HowItWorksPage } from './pages/HowItWorksPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';

function MainApp() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [bookingModal, setBookingModal] = useState({ isOpen: false, provider: null, initialService: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, booking: null });
  const [chatDrawer, setChatDrawer] = useState({ isOpen: false, booking: null });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null });
  const [complaintModal, setComplaintModal] = useState({ isOpen: false, booking: null });
  const [compareList, setCompareList] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Trigger Booking Modal
  const handleOpenBooking = (provider, service = null) => {
    setBookingModal({
      isOpen: true,
      provider,
      initialService: service
    });
  };

  const handleBookingSuccess = (createdBooking) => {
    // If online payment chosen, prompt payment modal
    if (createdBooking.paymentMethod === 'online' || createdBooking.paymentStatus === 'paid') {
      navigate('/customer/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  // Provider Comparison Handler
  const handleToggleCompare = (provider) => {
    setCompareList(prev => {
      const exists = prev.find(p => p._id === provider._id);
      if (exists) {
        return prev.filter(p => p._id !== provider._id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 providers at a time.');
        return prev;
      }
      return [...prev, provider];
    });
  };

  const handleRemoveCompare = (providerId) => {
    setCompareList(prev => prev.filter(p => p._id !== providerId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenAiModal={() => setAiModalOpen(true)} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenAiModal={() => setAiModalOpen(true)}
                onBookProvider={handleOpenBooking}
                onCompareProvider={handleToggleCompare}
                compareList={compareList}
              />
            }
          />
          <Route path="/services" element={<ServicesPage />} />
          <Route
            path="/providers"
            element={
              <ProvidersPage
                onBookProvider={handleOpenBooking}
                onCompareProvider={handleToggleCompare}
                compareList={compareList}
                onOpenCompareModal={() => setCompareModalOpen(true)}
              />
            }
          />
          <Route
            path="/providers/:id"
            element={
              <ProviderDetailPage
                onBookProvider={handleOpenBooking}
                onSelectServiceForBooking={handleOpenBooking}
              />
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <CustomerDashboard
                onOpenChat={(b) => setChatDrawer({ isOpen: true, booking: b })}
                onOpenPayment={(b) => setPaymentModal({ isOpen: true, booking: b })}
                onOpenReview={(b) => setReviewModal({ isOpen: true, booking: b })}
                onOpenComplaint={(b) => setComplaintModal({ isOpen: true, booking: b })}
              />
            }
          />
          <Route path="/customer/bookings" element={<Navigate to="/customer/dashboard" replace />} />

          {/* Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProviderDashboard
                onOpenChat={(b) => setChatDrawer({ isOpen: true, booking: b })}
              />
            }
          />
          <Route path="/provider/bookings" element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="/provider/earnings" element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="/provider/reviews" element={<Navigate to="/provider/dashboard" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Auth & Static Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSelectProviderForBooking={(prov) => handleOpenBooking(prov)}
      />

      <BookingModal
        isOpen={bookingModal.isOpen}
        provider={bookingModal.provider}
        initialService={bookingModal.initialService}
        onClose={() => setBookingModal({ isOpen: false, provider: null, initialService: null })}
        onSuccess={handleBookingSuccess}
      />

      <PaymentModal
        isOpen={paymentModal.isOpen}
        booking={paymentModal.booking}
        onClose={() => setPaymentModal({ isOpen: false, booking: null })}
        onSuccess={() => {
          // reload current page or close
        }}
      />

      <ChatDrawer
        isOpen={chatDrawer.isOpen}
        booking={chatDrawer.booking}
        onClose={() => setChatDrawer({ isOpen: false, booking: null })}
      />

      <ReviewModal
        isOpen={reviewModal.isOpen}
        booking={reviewModal.booking}
        onClose={() => setReviewModal({ isOpen: false, booking: null })}
        onSuccess={() => {}}
      />

      <ComplaintModal
        isOpen={complaintModal.isOpen}
        booking={complaintModal.booking}
        onClose={() => setComplaintModal({ isOpen: false, booking: null })}
        onSuccess={() => {}}
      />

      <CompareModal
        isOpen={compareModalOpen}
        providers={compareList}
        onClose={() => setCompareModalOpen(false)}
        onBookProvider={handleOpenBooking}
        onRemoveProvider={handleRemoveCompare}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <LocationProvider>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <MainApp />
            </BrowserRouter>
          </SocketProvider>
        </AuthProvider>
      </LocationProvider>
    </LanguageProvider>
  );
}
