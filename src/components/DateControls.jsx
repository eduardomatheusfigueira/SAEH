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
  const currentReferenceDateObj = new Date(referenceDate);
  const currentReferenceYear = currentReferenceDateObj.getFullYear();
  const currentReferenceMonth = currentReferenceDateObj.getMonth(); // 0-indexed
  const currentReferenceDay = currentReferenceDateObj.getDate();

  // Slider configurations for months
  const sliderMinMonths = 0; // Represents the first month of minEventYear
  const sliderMaxMonths = (maxEventYear - minEventYear) * 12 + 11; // Represents the last month of maxEventYear
  
  const currentSliderValueInMonths = (currentReferenceYear - minEventYear) * 12 + currentReferenceMonth;

  const handleReferenceDateSliderChange = (event) => {
    const totalMonthsOffset = parseInt(event.target.value, 10); // Value from slider (0 to sliderMaxMonths)

    const year = minEventYear + Math.floor(totalMonthsOffset / 12);
    const month = totalMonthsOffset % 12; // 0-indexed month

    let dayToSet = currentReferenceDay;
    // Check if the current day is valid for the new month and year
    const tempDate = new Date(year, month, currentReferenceDay);
    if (tempDate.getMonth() !== month) {
        // Day is invalid (e.g., trying to set Feb 30), so set to last day of the new month
        dayToSet = new Date(year, month + 1, 0).getDate();
    }

    const newDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayToSet).padStart(2, '0')}`;
    onReferenceDateChange(newDate);
  };

  // For the slider title
  const yearForSliderTitle = minEventYear + Math.floor(currentSliderValueInMonths / 12);
  const monthForSliderTitle = (currentSliderValueInMonths % 12) + 1; // 1-indexed for display
  const sliderTitle = `Data: ${yearForSliderTitle}-${String(monthForSliderTitle).padStart(2, '0')}`;
 
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
            min={sliderMinMonths}
            max={sliderMaxMonths}
            value={currentSliderValueInMonths}
            onChange={handleReferenceDateSliderChange}
            style={{ flexGrow: 1, margin: '0 5px' }} // Range slider might need specific styling
            title={sliderTitle}
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