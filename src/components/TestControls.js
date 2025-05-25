import React, { useState, useEffect } from 'react';
import { getDatabase, ref, update, onValue, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Define admin user ID - replace this with your actual admin user ID
const ADMIN_USER_ID = "oXFmOG1pE2ZV7RuiBUqdKe5c2TC2"; // Replace with your actual admin user ID

const TestControls = ({ user }) => {
  const [machines, setMachines] = useState([]);
  const [machineId, setMachineId] = useState('');
  const [status, setStatus] = useState('inactive');
  const [newMachineName, setNewMachineName] = useState('');
  const [machineType, setMachineType] = useState('washer');
  const [machineLocation, setMachineLocation] = useState('Test Location');

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
    
    // If changing to 'active', set start time
    if (status === 'active') {
      updates.startTime = Date.now();
    }
    
    // Update Firebase
    update(machineRef, updates)
      .then(() => alert(`Machine status updated to ${status}`))
      .catch(error => alert(`Error: ${error.message}`));
  };

  // Remove a machine from Firebase
  const removeMachine = () => {
    // Check for authentication
    if (!user) {
      alert('You must be signed in to remove machines');
      return;
    }
    
    if (!machineId) {
      alert('Please select a machine to remove');
      return;
    }
    
    // Confirm before deletion
    if (!window.confirm(`Are you sure you want to remove this machine? This action cannot be undone.`)) {
      return;
    }
    
    // Create reference to the specific machine
    const machineRef = ref(database, `machines/${machineId}`);
    
    // Remove from Firebase
    remove(machineRef)
      .then(() => {
        alert('Machine removed successfully');
        setMachineId(''); // Reset selection
      })
      .catch(error => {
        console.error('Error removing machine:', error);
        alert(`Error: ${error.message}`);
      });
  };
  
  // Create a new machine in Firebase
  const createNewMachine = () => {
    console.log('Create machine button clicked');
    
    // Check for authentication
    if (!user) {
      alert('You must be signed in to create machines');
      return;
    }
    
    // Validate machine name
    const machineName = newMachineName.trim();
    if (!machineName) {
      alert('Please enter a name for the machine');
      return;
    }
    
    // Check for duplicate machine names
    const duplicateMachine = machines.find(machine => 
      machine.name.toLowerCase() === machineName.toLowerCase());
    
    if (duplicateMachine) {
      alert(`A machine with the name "${machineName}" already exists. Please use a different name.`);
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
        name: machineName,
        location: machineLocation,
        type: machineType,
        status: "inactive",
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

  // Check if current user has admin access
  const isAdmin = user && (user.uid === ADMIN_USER_ID);

  // If user is not logged in or is not the admin, don't render anything
  if (!user || !isAdmin) {
    return null; // Return nothing, completely hiding the component
  }
  
  return (
    <div className="test-controls">
      <h3>Test Controls</h3>
      
      <div className="control-section">
        <h4>Create New Test Machine</h4>
        
        <div className="form-group">
          <label>Machine Name:</label>
          <input 
            type="text" 
            value={newMachineName} 
            onChange={(e) => setNewMachineName(e.target.value)}
            placeholder="Enter machine name"
          />
        </div>
        
        <div className="form-group">
          <label>Machine Type:</label>
          <select
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
          >
            <option value="washer">Washer</option>
            <option value="dryer">Dryer</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Location:</label>
          <input 
            type="text" 
            value={machineLocation} 
            onChange={(e) => setMachineLocation(e.target.value)}
            placeholder="Enter location"
          />
        </div>
        
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <button onClick={updateMachineStatus}>
              Update Status
            </button>
            
            <button onClick={removeMachine} style={{ backgroundColor: '#dc3545', marginTop: '10px' }}>
              Remove Machine
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
                <button 
                  className="remove-btn" 
                  onClick={() => {
                    setMachineId(machine.id);
                    removeMachine();
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="control-section">
        <h4>Email Notification Testing</h4>
        <EmailTestPanel user={user} />
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
        
        .status-active {
          color: #007bff;
          font-weight: bold;
        }
        
        .status-inactive {
          color: #6c757d;
        }
        
        .remove-btn {
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 16px;
          line-height: 1;
          padding: 0;
          margin-left: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          float: right;
        }
        
        .remove-btn:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

// Email Test Panel Component
const EmailTestPanel = ({ user }) => {
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('LaundryOnline Test Email');
  const [testMessage, setTestMessage] = useState('This is a test email from LaundryOnline.');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState({ success: false, message: '' });

  const sendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setSending(true);
    setSendResult({ success: false, message: '' });

    try {
      const functions = getFunctions();
      const sendTestEmailFunction = httpsCallable(functions, 'sendTestEmail');
      
      const result = await sendTestEmailFunction({
        email: testEmail,
        subject: testSubject,
        message: testMessage
      });

      setSendResult({
        success: true,
        message: `Success! Email sent to ${testEmail}`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      setSendResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="email-test-panel">
      <div className="form-group">
        <label>Recipient Email:</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter email address"
          disabled={sending}
        />
      </div>

      <div className="form-group">
        <label>Subject:</label>
        <input
          type="text"
          value={testSubject}
          onChange={(e) => setTestSubject(e.target.value)}
          placeholder="Email subject"
          disabled={sending}
        />
      </div>

      <div className="form-group">
        <label>Message:</label>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Email message"
          rows="4"
          disabled={sending}
          style={{ width: '100%', maxWidth: '300px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da' }}
        />
      </div>

      <button
        onClick={sendTestEmail}
        disabled={sending || !testEmail}
        style={{
          backgroundColor: sending ? '#6c757d' : '#28a745',
          opacity: sending || !testEmail ? 0.7 : 1
        }}
      >
        {sending ? 'Sending...' : 'Send Test Email'}
      </button>

      {sendResult.message && (
        <div className={`email-result ${sendResult.success ? 'success' : 'error'}`}>
          {sendResult.message}
        </div>
      )}

      <style jsx="true">{`
        .email-test-panel {
          margin-top: 1rem;
        }
        
        .email-result {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .email-result.success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .email-result.error {
          background-color: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};

export default TestControls;
