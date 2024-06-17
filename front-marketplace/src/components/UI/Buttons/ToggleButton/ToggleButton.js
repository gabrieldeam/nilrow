import React, { useState, useEffect } from 'react';
import './ToggleButton.css';

const ToggleButton = ({ initial = false, onToggle }) => {
  const [toggled, setToggled] = useState(initial);

  useEffect(() => {
    setToggled(initial);
  }, [initial]);

  const handleClick = () => {
    const newState = !toggled;
    setToggled(newState);
    onToggle(newState); // Passando o novo estado
  };

  return (
    <div className={`toggle-button ${toggled ? 'toggled' : ''}`} onClick={handleClick}>
      <div className={`toggle-button-circle ${toggled ? 'toggled' : ''}`}></div>
    </div>
  );
};

export default ToggleButton;
