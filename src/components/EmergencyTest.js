import React from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { database } from '../firebase'; // Import the existing database instance

const EmergencyTest = () => {
  // Direct write test with no dependencies
  const testDirectWrite = () => {
    // Log that the function was called
    console.log('Emergency test button clicked!');
    document.getElementById('status').textContent = 'Button clicked! Checking console...';
    
    try {
      // Create a test object
      const testData = {
        timestamp: Date.now(),
        message: 'Emergency test write'
      };
      
      // Write to a test location
      console.log('Attempting emergency test write:', testData);
      
      const testRef = ref(database, 'emergency_test');
      set(testRef, testData)
        .then(() => {
          console.log('EMERGENCY TEST SUCCESS: Write succeeded');
          document.getElementById('status').textContent = 'Success! Data written to Firebase.';
          document.getElementById('status').style.color = 'green';
        })
        .catch(error => {
          console.error('EMERGENCY TEST FAILED:', error);
          document.getElementById('status').textContent = `Error: ${error.message}`;
          document.getElementById('status').style.color = 'red';
        });
    } catch (error) {
      console.error('EMERGENCY TEST CRITICAL ERROR:', error);
      document.getElementById('status').textContent = `Critical error: ${error.message}`;
      document.getElementById('status').style.color = 'red';
    }
  };

  return (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#ffebee',
      border: '2px solid #f44336',
      borderRadius: '8px'
    }}>
      <h3>Emergency Firebase Test</h3>
      <p>This is an isolated component that tests Firebase write access directly.</p>
      
      <button 
        onClick={testDirectWrite}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        EMERGENCY TEST WRITE
      </button>
      
      <div 
        id="status" 
        style={{
          marginTop: '10px',
          fontWeight: 'bold'
        }}
      >
        Ready for test...
      </div>
    </div>
  );
};

export default EmergencyTest;
