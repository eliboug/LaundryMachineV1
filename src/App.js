import React, { useState } from 'react';
import './App.css';
import MachineStatusDashboard from './components/MachineStatusDashboard';
import NotificationManager from './components/NotificationManager';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>LaundryOnline</h1>
        <p>Never miss when your laundry is done!</p>
      </header>

      <main className="App-main">
        <MachineStatusDashboard />
        <NotificationManager />
      </main>

      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} LaundryOnline</p>
      </footer>
    </div>
  );
}

export default App;
