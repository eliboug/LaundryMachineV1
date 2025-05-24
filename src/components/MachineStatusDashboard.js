import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import MachineCard from './MachineCard';

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

  // Function to handle notification requests
  const handleNotify = (machineId) => {
    // Here you would implement your notification logic
    console.log(`Notification requested for machine ${machineId}`);
    // This could be where you set up notifications when the machine cycle is complete
  };

  // Filter machines by status
  const availableMachines = machines.filter(machine => 
    machine.status === 'inactive' || machine.status === 'available'
  );
  
  const inUseMachines = machines.filter(machine => 
    machine.status === 'active' || machine.status === 'in-use'
  );

  if (loading) {
    return <div className="loading">Loading machine status...</div>;
  }

  return (
    <div className="machines-container">
      <h1 className="page-title">Machines</h1>
      
      {machines.length === 0 ? (
        <p className="no-machines">No machines found. Please check your connection.</p>
      ) : (
        <>
          <div className="machine-section">
            <h2 className="section-title">Available</h2>
            {availableMachines.length === 0 ? (
              <p className="no-machines-message">No available machines at the moment.</p>
            ) : (
              <div className="machine-list">
                {availableMachines.map(machine => (
                  <MachineCard 
                    key={machine.id} 
                    machine={machine}
                    onNotify={handleNotify}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="machine-section">
            <h2 className="section-title">In Use</h2>
            {inUseMachines.length === 0 ? (
              <p className="no-machines-message">No machines currently in use.</p>
            ) : (
              <div className="machine-list">
                {inUseMachines.map(machine => (
                  <MachineCard 
                    key={machine.id} 
                    machine={machine}
                    onNotify={handleNotify}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MachineStatusDashboard;
