import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, update, get } from 'firebase/database';
import washerIcon from '../assets/washer.svg';
import dryerIcon from '../assets/dryer.svg';
import { useAuth } from '../contexts/AuthContext';

const MachineCard = ({ machine }) => {
  const { currentUser } = useAuth();
  const [notifyStatus, setNotifyStatus] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Check if user is already subscribed to this machine's notifications
  React.useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUser || !machine.id) return;
      
      try {
        const subscriptionRef = ref(database, `machines/${machine.id}/subscribers/${currentUser.uid}`);
        const snapshot = await get(subscriptionRef);
        setIsSubscribed(snapshot.exists() && snapshot.val() === true);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    
    checkSubscription();
  }, [currentUser, machine.id]);
  
  // Get the correct icon based on machine type
  const getMachineIcon = (type) => {
    return type.toLowerCase().includes('dryer') ? dryerIcon : washerIcon;
  };
  
  // Handle notify button click
  const handleNotify = async () => {
    if (!currentUser || !machine.id) return;
    
    try {
      setNotifyStatus('processing');
      
      if (isSubscribed) {
        // Unsubscribe from notifications
        const updates = {};
        updates[`machines/${machine.id}/subscribers/${currentUser.uid}`] = null;
        await update(ref(database), updates);
        setIsSubscribed(false);
        setNotifyStatus('unsubscribed');
      } else {
        // Subscribe to notifications
        const updates = {};
        updates[`machines/${machine.id}/subscribers/${currentUser.uid}`] = true;
        updates[`users/${currentUser.uid}/subscribedMachines/${machine.id}`] = {
          name: machine.name,
          type: machine.type,
          subscribedAt: new Date().toISOString()
        };
        await update(ref(database), updates);
        setIsSubscribed(true);
        setNotifyStatus('subscribed');
      }
      
      // Clear status after a few seconds
      setTimeout(() => setNotifyStatus(''), 3000);
    } catch (error) {
      console.error('Error updating notification subscription:', error);
      setNotifyStatus('error');
      setTimeout(() => setNotifyStatus(''), 3000);
    }
  };

  // Get appropriate button text based on subscription status
  const getButtonText = () => {
    if (notifyStatus === 'processing') return 'Processing...';
    if (notifyStatus === 'subscribed') return 'Subscribed!';
    if (notifyStatus === 'unsubscribed') return 'Unsubscribed';
    if (notifyStatus === 'error') return 'Error';
    return isSubscribed ? 'Unsubscribe' : 'Notify Me';
  };
  
  return (
    <div className="machine-card">
      <div className="machine-image">
        <img src={getMachineIcon(machine.type)} alt={machine.type} />
      </div>
      <div className="machine-info">
        <h3>{machine.name}</h3>
        <p className="machine-type">{machine.type}</p>
        {machine.status === 'active' && (
          <div className="status-badge active">In Use</div>
        )}
        {machine.status === 'inactive' && (
          <div className="status-badge available">Available</div>
        )}
      </div>
      <button 
        className={`notify-btn ${isSubscribed ? 'subscribed' : ''} ${notifyStatus ? notifyStatus : ''}`} 
        onClick={handleNotify}
        disabled={notifyStatus === 'processing'}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default MachineCard;
