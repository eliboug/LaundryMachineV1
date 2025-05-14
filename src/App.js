import React from 'react';
import './App.css';
import MachineStatusDashboard from './components/MachineStatusDashboard';
import NotificationManager from './components/NotificationManager';
import TestControls from './components/TestControls';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';


// App content component that uses the auth context
function AppContent() {
  const { currentUser } = useAuth();

  // If user is not logged in, only show the Auth component in full screen
  if (!currentUser) {
    return (
      <div className="App full-page-auth">
        <Auth />
      </div>
    );
  }

  // Otherwise show the full application with header and footer
  return (
    <div className="App">
      <header className="App-header">
        <h1>LaundryOnline</h1>
        <p>Never miss when your laundry is done!</p>
      </header>

      <main className="App-main">
        <Auth />
        <MachineStatusDashboard user={currentUser} />
        <NotificationManager user={currentUser} />
        <TestControls user={currentUser} />
      </main>

      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} LaundryOnline</p>
      </footer>
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
