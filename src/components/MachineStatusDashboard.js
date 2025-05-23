import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

const MachineStatusDashboard = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference to the machines node in Firebase
    const machinesRef = ref(database, 'machines');
    
    // Listen for changes to machine status
    const unsubscribe = onValue(machinesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert the object to an array
        const machineList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMachines(machineList);
      } else {
        setMachines([]);
      }
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Calculate how long the machine has been active
  const calculateActiveTime = (startTime) => {
    if (!startTime) return 'Recently activated';
    
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const elapsedMs = now - start;
    
    // Convert to minutes
    const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000));
    
    if (elapsedMinutes < 60) {
      return `Active for ${elapsedMinutes} minutes`;
    } else {
      const hours = Math.floor(elapsedMinutes / 60);
      const minutes = elapsedMinutes % 60;
      return `Active for ${hours}h ${minutes}m`;
    }
  };

  if (loading) {
    return <div>Loading machine status...</div>;
  }

  return (
    <div className="machine-dashboard">
      <h2>Laundry Machine Status</h2>
      
      {machines.length === 0 ? (
        <p>No machines found. Please check your connection.</p>
      ) : (
        <div className="machine-grid">
          {machines.map(machine => (
            <div 
              key={machine.id} 
              className={`machine-card ${machine.status}`}
            >
              <h3>{machine.name}</h3>
              <p>Location: {machine.location}</p>
              <p>Type: {machine.type}</p>
              <p>Status: {machine.status}</p>
              {machine.status === 'active' && (
                <p>
                  {calculateActiveTime(machine.startTime)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MachineStatusDashboard;
