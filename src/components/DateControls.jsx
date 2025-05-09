import React from 'react';

const DateControls = ({
  referenceDate,
  onReferenceDateChange,
  timeWindowYears,
  onTimeWindowYearsChange,
  minEventYear,
  maxEventYear,
  onMinEventYearChange, // New prop
  onMaxEventYearChange, // New prop
}) => {
  const currentReferenceYear = referenceDate ? new Date(referenceDate).getFullYear() : new Date().getFullYear();

  const handleReferenceDateSliderChange = (event) => {
    const year = parseInt(event.target.value, 10);
    const currentMonthDate = referenceDate ? new Date(referenceDate) : new Date(year, 0, 1);
    const currentMonth = currentMonthDate.getMonth(); // 0-based
    const currentDay = currentMonthDate.getDate();
    
    let dayToSet = currentDay;
    const tempDate = new Date(year, currentMonth, currentDay);
    if (tempDate.getMonth() !== currentMonth) {
        dayToSet = new Date(year, currentMonth + 1, 0).getDate();
    }

    const newDate = `${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayToSet).padStart(2, '0')}`;
    onReferenceDateChange(newDate);
  };

  const containerStyle = {
    // position: 'absolute', // Removed
    // top: '10px', // Removed
    // right: '10px', // Removed
    // zIndex: 10, // Will be controlled by parent
    padding: '10px', // Keep padding for internal spacing if desired, or remove if parent handles all
    // No background color by default
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    // Add a border or subtle background if needed for visual separation without a full panel
    // border: '1px solid #ddd',
    // borderRadius: '5px',
    // backgroundColor: 'rgba(255, 255, 255, 0.7)', // Optional subtle background
  };

  const controlGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
  };
  
  const labelStyle = {
    marginBottom: '3px',
    fontSize: '0.9em',
    fontWeight: 'bold',
    color: '#333', // Darker text for better readability without background
  };

  const inputStyle = {
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9em',
  };


  return (
    <div style={containerStyle}>
      <div style={controlGroupStyle}>
        <label htmlFor="ref-date-input-top" style={labelStyle}>Data de Referência:</label>
        <input
          type="date"
          id="ref-date-input-top"
          value={referenceDate}
          onChange={(e) => onReferenceDateChange(e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px', gap: '5px' }}>
          <input
            type="number"
            aria-label="Ano mínimo do slider"
            value={minEventYear}
            onChange={(e) => onMinEventYearChange(parseInt(e.target.value, 10))}
            style={{ ...inputStyle, width: '60px', textAlign: 'center' }}
          />
          <input
            type="range"
            id="ref-date-slider-top"
            min={minEventYear || 1400}
            max={maxEventYear || new Date().getFullYear()}
            value={currentReferenceYear}
            onChange={handleReferenceDateSliderChange}
            style={{ flexGrow: 1, margin: '0 5px' }}
            title={`Ano: ${currentReferenceYear}`}
          />
          <input
            type="number"
            aria-label="Ano máximo do slider"
            value={maxEventYear}
            onChange={(e) => onMaxEventYearChange(parseInt(e.target.value, 10))}
            style={{ ...inputStyle, width: '60px', textAlign: 'center' }}
          />
        </div>
        <span style={{ fontSize: '0.8em', textAlign: 'center', color: '#555', marginTop: '2px' }}>Ano Selecionado: {currentReferenceYear}</span>
      </div>
      
      <div style={controlGroupStyle}>
        <label htmlFor="time-window-input-top" style={labelStyle}>Janela de Tempo (Anos):</label>
        <input
          type="number"
          id="time-window-input-top"
          value={timeWindowYears}
          onChange={(e) => onTimeWindowYearsChange(parseInt(e.target.value, 10))}
          min="0"
          style={{ ...inputStyle, width: '70px' }}
        />
      </div>
    </div>
  );
};

export default DateControls;