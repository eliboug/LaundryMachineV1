import React, { useState, useEffect } from 'react';
import { database, messaging } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { getToken, onMessage } from 'firebase/messaging';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request permission for notifications
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
          console.warn('This browser does not support desktop notifications');
          return;
        }
        
        // Request permission for notifications
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          setPermissionGranted(true);
          
          // Check if FCM is supported
          if (messaging) {
            try {
              // Get the token for this device
              const token = await getToken(messaging, {
                vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace with your VAPID key
              });
              
              // Save the token to the database
              // This token will be used to send notifications to this device
              console.log('Notification token:', token);
              
              // Here you would store the token in Firebase under the user's account
              // This is just a stub - you'll need to implement user authentication
              // to associate tokens with specific users
            } catch (fcmError) {
              console.warn('Failed to get FCM token:', fcmError);
              // We can still use regular browser notifications
            }
          } else {
            console.log('Firebase Cloud Messaging not supported in this browser. Using regular browser notifications only.');
          }
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };
    
    requestNotificationPermission();
  }, []);

  // Listen for machine status changes
  useEffect(() => {
    if (!permissionGranted) return;
    
    // Reference to the machines node in Firebase
    const machinesRef = ref(database, 'machines');
    
    const unsubscribe = onValue(machinesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      
      // Check for completed machines and create notifications
      Object.keys(data).forEach(key => {
        const machine = data[key];
        
        if (machine.status === 'complete' && machine.notified === false) {
          // Create new notification
          const newNotification = {
            id: key,
            title: `${machine.name} is done!`,
            message: `Your laundry in ${machine.name} has completed its cycle.`,
            timestamp: new Date().toISOString(),
            read: false
          };
          
          setNotifications(prev => [...prev, newNotification]);
          
          // Display browser notification
          if (permissionGranted && 'Notification' in window) {
            new Notification(newNotification.title, {
              body: newNotification.message
            });
          }
          
          // You would also update the machine's notified status in Firebase here
        }
      });
    });
    
    // Set up a function to clean up listeners
    let messageUnsubscribe = () => {}; // Default no-op function
    
    // Listen for messages from Firebase Cloud Messaging only if available
    if (messaging) {
      try {
        messageUnsubscribe = onMessage(messaging, (payload) => {
          console.log('Message received:', payload);
          
          // Create notification from payload
          const newNotification = {
            id: Date.now().toString(),
            title: payload.notification.title,
            message: payload.notification.body,
            timestamp: new Date().toISOString(),
            read: false
          };
          
          setNotifications(prev => [...prev, newNotification]);
          
          // Display browser notification
          if (permissionGranted && 'Notification' in window) {
            new Notification(newNotification.title, {
              body: newNotification.message
            });
          }
        });
      } catch (error) {
        console.warn('Failed to set up Firebase Cloud Messaging listener:', error);
        // Continue without FCM
      }
    }
    
    return () => {
      unsubscribe();
      messageUnsubscribe();
    };
  }, [permissionGranted]);

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(note => 
        note.id === id ? { ...note, read: true } : note
      )
    );
  };

  return (
    <div className="notifications-container">
      <h1 className="page-title">Notifications</h1>
      
      {!permissionGranted && (
        <div className="permission-request">
          <p>Enable notifications to get alerts when your laundry is done.</p>
          <button className="enable-notifications-btn" onClick={() => Notification.requestPermission()}>
            Enable Notifications
          </button>
        </div>
      )}
      
      {notifications.length === 0 ? (
        <div className="empty-notifications">
          <p>You don't have any notifications yet</p>
          <span>When your laundry is done, you'll receive a notification here</span>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(note => (
            <div 
              key={note.id} 
              className={`notification-item ${note.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(note.id)}
            >
              <div className="notification-content">
                <h4>{note.title}</h4>
                <p>{note.message}</p>
                <span className="notification-time">{new Date(note.timestamp).toLocaleString()}</span>
              </div>
              {!note.read && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
