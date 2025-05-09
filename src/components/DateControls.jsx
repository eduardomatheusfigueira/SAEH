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

  // containerStyle removed, will be handled by CSS class "date-controls-container"

  const controlGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
  };
  
  const labelStyle = {
    marginBottom: '3px',
    fontSize: '0.9em',
    fontWeight: 'bold',
    // color: '#333', // Will inherit from parent or global CSS
  };

  const inputBaseStyle = { // Renamed to avoid conflict if a global .inputStyle exists
    padding: '5px',
    // border: '1px solid #ccc', // Will be handled by CSS
    borderRadius: '4px',
    fontSize: '0.9em',
  };


  return (
    <div className="date-controls-container"> {/* Changed to className */}
      <div style={controlGroupStyle}>
        <label htmlFor="ref-date-input-top" style={labelStyle}>Data de Referência:</label>
        <input
          type="date"
          id="ref-date-input-top"
          className="themed-input" // Added class for styling
          value={referenceDate}
          onChange={(e) => onReferenceDateChange(e.target.value)}
          style={inputBaseStyle} // Kept base style, border/color from class
        />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px', gap: '5px' }}>
          <input
            type="number"
            aria-label="Ano mínimo do slider"
            className="themed-input" // Added class
            value={minEventYear}
            onChange={(e) => onMinEventYearChange(parseInt(e.target.value, 10))}
            style={{ ...inputBaseStyle, width: '60px', textAlign: 'center' }}
          />
          <input
            type="range"
            id="ref-date-slider-top"
            min={minEventYear || 1400}
            max={maxEventYear || new Date().getFullYear()}
            value={currentReferenceYear}
            onChange={handleReferenceDateSliderChange}
            style={{ flexGrow: 1, margin: '0 5px' }} // Range slider might need specific styling
            title={`Ano: ${currentReferenceYear}`}
          />
          <input
            type="number"
            aria-label="Ano máximo do slider"
            className="themed-input" // Added class
            value={maxEventYear}
            onChange={(e) => onMaxEventYearChange(parseInt(e.target.value, 10))}
            style={{ ...inputBaseStyle, width: '60px', textAlign: 'center' }}
          />
        </div>
        <span className="year-display-span">Ano Selecionado: {currentReferenceYear}</span> {/* Added class */}
      </div>
      
      <div style={controlGroupStyle}>
        <label htmlFor="time-window-input-top" style={labelStyle}>Janela de Tempo (Anos):</label>
        <input
          type="number"
          id="time-window-input-top"
          className="themed-input" // Added class
          value={timeWindowYears}
          onChange={(e) => onTimeWindowYearsChange(parseInt(e.target.value, 10))}
          min="0"
          style={{ ...inputBaseStyle, width: '70px' }}
        />
      </div>
    </div>
  );
};

export default DateControls;