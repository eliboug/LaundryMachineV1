import React, { useState } from 'react';
import './App.css';
import MachineStatusDashboard from './components/MachineStatusDashboard';
import NotificationManager from './components/NotificationManager';
import Settings from './components/Settings';
import TestControls from './components/TestControls';
import Auth from './components/Auth';
import Header from './components/Header';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// App content component that uses the auth context
function AppContent() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('machines');

  // If user is not logged in, only show the Auth component in full screen
  if (!currentUser) {
    return (
      <div className="app full-page-auth">
        <Auth />
      </div>
    );
  }

  // Function to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'machines':
        return <MachineStatusDashboard user={currentUser} />;
      case 'notifications':
        return <NotificationManager user={currentUser} />;
      case 'settings':
        return <Settings />;
      default:
        return <MachineStatusDashboard user={currentUser} />;
    }
  };

  // Otherwise show the full application with header and tab-based content
  return (
    <div className="app">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="app-main">
        {renderTabContent()}
      </main>
      
      {/* Only show TestControls in a development panel for admin users */}
      {isAdmin && (
        <div className="dev-controls">
          <details>
            <summary>Development Controls</summary>
            <TestControls user={currentUser} />
          </details>
        </div>
      )}
    </div>
  );
}

// Main App component wrapped in the AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
