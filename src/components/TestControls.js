import React, { useState, useEffect } from 'react';
import { getDatabase, ref, update, onValue, set } from 'firebase/database';
import { database } from '../firebase';

const TestControls = ({ user }) => {
  const [machines, setMachines] = useState([]);
  const [machineId, setMachineId] = useState('');
  const [status, setStatus] = useState('available');

  // Load machines from Firebase
  useEffect(() => {
    const machinesRef = ref(database, 'machines');
    const unsubscribe = onValue(machinesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const machineList = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      console.log('Machines loaded:', machineList);
      setMachines(machineList);
      
      // Select first machine if none selected
      if (machineList.length > 0 && !machineId) {
        setMachineId(machineList[0].id);
      }
    });
    
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Function to update machine status
  const updateMachineStatus = () => {
    // Check for authentication
    if (!user) {
      alert('You must be signed in to update machine status');
      return;
    }
    
    if (!machineId) {
      alert('Please select a machine first!');
      return;
    }
    
    // Create reference to the specific machine
    const machineRef = ref(database, `machines/${machineId}`);
    
    // Update fields based on the status
    const updates = { 
      status,
      lastUpdatedBy: user.uid,
      lastUpdatedAt: Date.now()
    };
    
    // If changing to 'running', set start time and ensure notified is false
    if (status === 'running') {
      updates.startTime = Date.now();
      updates.estimatedDuration = 45;  // 45 minutes default
      updates.notified = false;
    }
    
    // If changing to 'complete', make sure notified is false to trigger notification
    if (status === 'complete') {
      updates.notified = false;
    }
    
    // Update Firebase
    update(machineRef, updates)
      .then(() => alert(`Machine status updated to ${status}`))
      .catch(error => alert(`Error: ${error.message}`));
  };

  // Create a new machine in Firebase
  const createNewMachine = () => {
    console.log('Create machine button clicked');
    
    // Check for authentication
    if (!user) {
      alert('You must be signed in to create machines');
      return;
    }
    
    try {
      // Get a direct reference to make sure we're using the right database
      const db = getDatabase();
      console.log('Firebase database instance:', db);
      
      // Generate a unique machine ID
      const timestamp = Date.now();
      const newId = `machine_${timestamp}`;
      
      // Create a machine object with user information
      const machineData = {
        id: newId,
        name: `Machine ${timestamp.toString().slice(-4)}`,
        location: "Test Location",
        type: Math.random() > 0.5 ? "washer" : "dryer",
        status: "available",
        notified: false,
        createdAt: timestamp,
        createdBy: user.uid,
        lastUpdatedBy: user.uid,
        lastUpdatedAt: timestamp
      };
      
      console.log('About to write machine to Firebase:', machineData);
      
      // Write to Firebase
      const machineRef = ref(db, `machines/${newId}`);
      
      // Use the set promise
      set(machineRef, machineData)
        .then(() => {
          console.log('✅ SUCCESS: Machine created in Firebase');
          alert(`Machine created: ${machineData.name}`);
        })
        .catch(error => {
          console.error('❌ ERROR: Failed to create machine:', error);
          alert(`Failed to create machine: ${error.message}\n\nError code: ${error.code}`);
          
          if (error.code === 'PERMISSION_DENIED') {
            alert('Firebase security rules are preventing you from writing to the database. Please check your rules configuration.');
          }
        });
    } catch (err) {
      console.error('❌ CRITICAL ERROR in createNewMachine function:', err);
      alert(`Critical error: ${err.message}`);
    }
  };

  return (
    <div className="test-controls">
      <h3>Test Controls</h3>
      
      <div className="control-section">
        <h4>Create New Test Machine</h4>
        <button onClick={createNewMachine}>
          Create New Machine
        </button>
      </div>
      
      <div className="control-section">
        <h4>Change Machine Status</h4>
        
        {machines.length === 0 ? (
          <p>No machines found. Create one first!</p>
        ) : (
          <>
            <div className="form-group">
              <label>Select Machine:</label>
              <select 
                value={machineId} 
                onChange={(e) => setMachineId(e.target.value)}
              >
                <option value="">-- Select Machine --</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>
                    {machine.name} ({machine.type}) - {machine.status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>New Status:</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="available">Available</option>
                <option value="running">Running</option>
                <option value="complete">Complete</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            
            <button onClick={updateMachineStatus}>
              Update Status
            </button>
          </>
        )}
      </div>
      
      <div className="machine-list">
        <h4>Current Machines ({machines.length})</h4>
        {machines.length === 0 ? (
          <p>No machines found in database.</p>
        ) : (
          <ul>
            {machines.map(machine => (
              <li key={machine.id}>
                <strong>{machine.name}</strong> ({machine.type}) - 
                Status: <span className={`status-${machine.status}`}>{machine.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <style jsx="true">{`
        .test-controls {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 2rem;
        }
        
        .control-section {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        select, button {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ced4da;
          width: 100%;
          max-width: 300px;
        }
        
        button {
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 500;
          margin-top: 0.5rem;
        }
        
        button:hover {
          background-color: #0069d9;
        }
        
        .machine-list {
          margin-top: 1rem;
        }
        
        .machine-list ul {
          list-style: none;
          padding: 0;
        }
        
        .machine-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .status-available {
          color: #28a745;
        }
        
        .status-running {
          color: #007bff;
        }
        
        .status-complete {
          color: #ffc107;
          font-weight: bold;
        }
        
        .status-offline {
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default TestControls;
