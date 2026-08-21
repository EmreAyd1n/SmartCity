import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import OfflineBadge from '../pwa/OfflineBadge';
import AIChatbotWidget from '../chat/AIChatbotWidget';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <OfflineBadge />
      <Header />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <AIChatbotWidget />
    </div>
  );
};

export default MainLayout;
