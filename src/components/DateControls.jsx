import React from 'react';

const DateControls = ({
  referenceDate,
  onReferenceDateChange,
  timeWindowYears,
  onTimeWindowYearsChange,
  minEventYear,
  maxEventYear,
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
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 10, // Ensure it's above map but potentially below modals
    padding: '10px',
    // No background color by default, can be added if needed
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    // borderRadius: '5px',
    // boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
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
        <label htmlFor="ref-date-input-top" style={labelStyle}>Reference Date:</label>
        <input
          type="date"
          id="ref-date-input-top"
          value={referenceDate}
          onChange={(e) => onReferenceDateChange(e.target.value)}
          style={inputStyle}
        />
        <input
          type="range"
          id="ref-date-slider-top"
          min={minEventYear || 1400}
          max={maxEventYear || new Date().getFullYear()}
          value={currentReferenceYear}
          onChange={handleReferenceDateSliderChange}
          style={{ width: '150px', marginTop: '5px' }} // Adjust width as needed
          title={`Year: ${currentReferenceYear}`}
        />
        <span style={{ fontSize: '0.8em', textAlign: 'center', color: '#555' }}>Year: {currentReferenceYear}</span>
      </div>
      <div style={controlGroupStyle}>
        <label htmlFor="time-window-input-top" style={labelStyle}>Time Window (Years):</label>
        <input
          type="number"
          id="time-window-input-top"
          value={timeWindowYears}
          onChange={(e) => onTimeWindowYearsChange(parseInt(e.target.value, 10))}
          min="0"
          style={{ ...inputStyle, width: '70px' }} // Adjust width
        />
      </div>
    </div>
  );
};

export default DateControls;