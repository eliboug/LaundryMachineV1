import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';

const Header = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  
  // Tabs for navigation
  const tabs = [
    { id: 'machines', label: 'Machines' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'settings', label: 'Settings' }
  ];
  
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Laundry Room</span>
        </div>
      </div>
      
      <div className="header-right">
        <nav className="main-nav">
          <ul className="nav-tabs">
            {tabs.map(tab => (
              <li key={tab.id} className={activeTab === tab.id ? 'active' : ''}>
                <button onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="user-avatar">
          <img 
            src={currentUser?.photoURL || defaultAvatar} 
            alt={currentUser?.displayName || 'User'} 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
