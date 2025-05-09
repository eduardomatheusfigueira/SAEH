import React from 'react';

const TimelineLegend = ({ themes }) => {
  if (!themes || themes.length === 0) {
    return null;
  }

  const legendStyle = {
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginTop: '10px',
    maxHeight: '150px', // Adjust as needed
    overflowY: 'auto',
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    fontSize: '0.9em',
  };

  const colorBoxStyle = (color) => ({
    width: '15px',
    height: '15px',
    backgroundColor: color || '#808080',
    marginRight: '8px',
    border: '1px solid #555',
  });

  return (
    <div style={legendStyle}>
      <h4 style={{ marginTop: 0, marginBottom: '8px' }}>Legenda de Temas</h4>
      {themes.map(theme => (
        <div key={theme.id} style={itemStyle} title={theme.description_short}>
          <span style={colorBoxStyle(theme.color)}></span>
          {theme.name}
        </div>
      ))}
    </div>
  );
};

export default TimelineLegend;