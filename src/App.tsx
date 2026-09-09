import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LinkProvider, useLinks } from './context/LinkContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { LinksView } from './views/LinksView';
import { BioTreesView } from './views/BioTreesView';
import { QRStudioView } from './views/QRStudioView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { AuthModal } from './components/AuthModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { RedirectionHandler } from './components/RedirectionHandler';
import { BioTreeViewer } from './components/BioTreeViewer';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

const DashboardContent: React.FC = () => {
  const { activeTab } = useLinks();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Workspace Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Dashboard Top Header Bar */}
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Interceptors for Shortcode Hash & Bio Tree Redirects */}
        <RedirectionHandler />
        <BioTreeViewer />

        {/* View Router Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'links' && <LinksView />}
          {activeTab === 'bio' && <BioTreesView />}
          {activeTab === 'qr' && <QRStudioView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Global Modals & Notifications */}
      <AuthModal />
      <QRCodeModal />
      <AnalyticsModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LinkProvider>
        <DashboardContent />
      </LinkProvider>
    </AuthProvider>
  );
}

export default App;
