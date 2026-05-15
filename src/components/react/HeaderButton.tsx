import React from 'react';

const HeaderButton = () => {
  const handleClick = () => {
    alert("Esto es una maqueta");
  };

  return (
    <button 
      onClick={handleClick} 
      className="btn-primary"
    >
      Solicitar servicio
    </button>
  );
};

export default HeaderButton;
