import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import ProductDetails from './pages/ProductDetails';
import Prescription from './pages/Prescription';
import HomeDelivery from './pages/HomeDelivery';
import CustomerDetails from './pages/CustomerDetails';
import StockDetails from './pages/StockDetails';
import StockInOut from './pages/StockInOut';
import PurchaseDetails from './pages/PurchaseDetails';
import AlternativeDrugs from './pages/AlternativeDrugs';
import DiscountOffers from './pages/DiscountOffers';
import MedicineTypes from './pages/MedicineTypes';
import LowStock from './pages/LowStock';
import ExpiryMedicines from './pages/ExpiryMedicines';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

const Layout = ({ children, stats, pageTitle }) => {
  return (
    <div className="app-container">
      <Sidebar stats={stats} />
      <div className="main-content">
        <Navbar pageTitle={pageTitle} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App = () => {
  const [stats, setStats] = useState(null);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout stats={stats} pageTitle="Dashboard Control Center"><Dashboard setStatsData={setStats} /></Layout>} />
            <Route path="/sales" element={<Layout stats={stats} pageTitle="POS Sales Terminal"><Sales /></Layout>} />
            <Route path="/medicines" element={<Layout stats={stats} pageTitle="Medicine Stock Inventory"><ProductDetails /></Layout>} />
            <Route path="/prescriptions" element={<Layout stats={stats} pageTitle="Patient Prescription Records"><Prescription /></Layout>} />
            <Route path="/home-delivery" element={<Layout stats={stats} pageTitle="Home Courier Shipments"><HomeDelivery /></Layout>} />
            <Route path="/customers" element={<Layout stats={stats} pageTitle="Customer Tracking Profile"><CustomerDetails /></Layout>} />
            <Route path="/stock-details" element={<Layout stats={stats} pageTitle="Stock Movement Audit Logs"><StockDetails /></Layout>} />
            <Route path="/stock-in-out" element={<Layout stats={stats} pageTitle="Manual Inventory Adjustments"><StockInOut /></Layout>} />
            <Route path="/purchase-details" element={<Layout stats={stats} pageTitle="Supplier Purchase Logs"><PurchaseDetails /></Layout>} />
            <Route path="/alternative-drugs" element={<Layout stats={stats} pageTitle="Therapeutic Alternatives Lookup"><AlternativeDrugs /></Layout>} />
            <Route path="/discount-offers" element={<Layout stats={stats} pageTitle="Discount Coupons & Broadcast"><DiscountOffers /></Layout>} />
            <Route path="/medicine-types" element={<Layout stats={stats} pageTitle="Dosage Classifications & Forms"><MedicineTypes /></Layout>} />
            <Route path="/low-stock" element={<Layout stats={stats} pageTitle="Low Stock Alarms Panel"><LowStock /></Layout>} />
            <Route path="/expiry-medicines" element={<Layout stats={stats} pageTitle="Expiry Warnings & Hazardous Disposal"><ExpiryMedicines /></Layout>} />
            <Route path="/reports" element={<Layout stats={stats} pageTitle="Business Ledger & Reports"><Reports /></Layout>} />
            <Route path="/notifications" element={<Layout stats={stats} pageTitle="System Notification Logs"><Notifications /></Layout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
