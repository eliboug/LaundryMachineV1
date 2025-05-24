import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import defaultAvatar from '../assets/default-avatar.png';

const Settings = () => {
  const { currentUser, logout, updateProfilePicture } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
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
