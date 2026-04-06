/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UploadProvider } from './context/UploadContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CreateEvent } from './pages/CreateEvent';
import { EventDetails } from './pages/EventDetails';
import { Group } from './pages/Group';
import { Gallery } from './pages/Gallery';
import { Account } from './pages/Account';
import { Upgrade } from './pages/Upgrade';
import { Payment } from './pages/Payment';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { ScanQR } from './pages/ScanQR';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Splash } from './pages/Splash';
import { Join } from './pages/Join';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/join" element={<Join />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="group" element={<Group />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="account" element={<Account />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="event/:id" element={<EventDetails />} />
        <Route path="upgrade" element={<Upgrade />} />
        <Route path="payment" element={<Payment />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="scan" element={<ScanQR />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <UploadProvider>
          <Router>
            <AppRoutes />
          </Router>
        </UploadProvider>
      </AppProvider>
    </AuthProvider>
  );
}
