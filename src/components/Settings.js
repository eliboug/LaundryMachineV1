import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';
import { database } from '../firebase';
import { ref, get, set } from 'firebase/database';

const Settings = () => {
  const { currentUser, logout, updateProfilePicture } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const fileInputRef = useRef(null);
  
  // Load user preferences from Firebase
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!currentUser) return;
      
      try {
        const userPrefsRef = ref(database, `users/${currentUser.uid}/preferences`);
        const snapshot = await get(userPrefsRef);
        
        if (snapshot.exists()) {
          const prefs = snapshot.val();
          if (prefs.emailNotifications !== undefined) {
            setEmailNotificationsEnabled(prefs.emailNotifications);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Toggle email notifications preference
  const toggleEmailNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const newValue = !emailNotificationsEnabled;
      setEmailNotificationsEnabled(newValue);
      
      // Update user preferences in Firebase
      const userPrefsRef = ref(database, `users/${currentUser.uid}/preferences/emailNotifications`);
      await set(userPrefsRef, newValue);
      
      setSaveStatus('Preferences saved');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error updating email preferences:', error);
      setSaveStatus('Error saving preferences');
    }
  };
  
  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    
    try {
      await updateProfilePicture(file);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1 className="page-title">Settings</h1>
      
      <div className="profile-section">
        <div className="profile-header">
          <div 
            className={`profile-avatar ${isUploading ? 'uploading' : ''}`}
            onClick={handleProfilePictureClick}
          >
            <img 
              src={currentUser?.photoURL || defaultAvatar} 
              alt={currentUser?.displayName || 'User'} 
            />
            <div className="avatar-overlay">
              <span>{isUploading ? 'Uploading...' : 'Change'}</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          {uploadError && <div className="upload-error">{uploadError}</div>}
          {uploadSuccess && <div className="upload-success">Profile picture updated!</div>}
          <div className="profile-info">
            <h2>{currentUser?.displayName || 'User'}</h2>
            <p>{currentUser?.email}</p>
          </div>
        </div>
        
        <div className="settings-options">
          <div className="settings-group">
            <h3>Notification Settings</h3>
            <div className="setting-item">
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <div className="setting-label">
                <p>Enable Push Notifications</p>
                <span>Receive notifications when your laundry is done</span>
              </div>
            </div>
          </div>
          
          <div className="settings-group">
            <h3>Notification Settings</h3>
            <div className="setting-item">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={emailNotificationsEnabled}
                  onChange={toggleEmailNotifications} 
                />
                <span className="toggle-slider"></span>
              </label>
              <div className="setting-label">
                <p>Email Notifications</p>
                <span>Receive email alerts when your laundry is done</span>
              </div>
            </div>
            {saveStatus && <div className="save-status">{saveStatus}</div>}
          </div>
          
          <div className="settings-group">
            <h3>Account Settings</h3>
            <button className="logout-button" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
