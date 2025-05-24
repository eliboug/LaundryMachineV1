import React from 'react';
import washerIcon from '../assets/washer.svg';
import dryerIcon from '../assets/dryer.svg';

const MachineCard = ({ machine, onNotify }) => {
  // Get the correct icon based on machine type
  const getMachineIcon = (type) => {
    return type.toLowerCase().includes('dryer') ? dryerIcon : washerIcon;
  };

  return (
    <div className="machine-card">
      <div className="machine-image">
        <img src={getMachineIcon(machine.type)} alt={machine.type} />
      </div>
      <div className="machine-info">
        <h3>{machine.name}</h3>
        <p className="machine-type">{machine.type}</p>
      </div>
      <button 
        className="notify-btn" 
        onClick={() => onNotify(machine.id)}
      >
        Notify
      </button>
    </div>
  );
};

export default MachineCard;
