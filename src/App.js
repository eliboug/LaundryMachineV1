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

  return (
    <div className="App">
      <header className="App-header">
        <h1>LaundryOnline</h1>
        <p>Never miss when your laundry is done!</p>
      </header>

      <main className="App-main">
        <Auth />
        
        {currentUser ? (
          <>
            <MachineStatusDashboard user={currentUser} />
            <NotificationManager user={currentUser} />
            <TestControls user={currentUser} />
          </>
        ) : (
          <div className="no-auth-message">
            <p>Please log in to access LaundryOnline features</p>
          </div>
        )}
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
