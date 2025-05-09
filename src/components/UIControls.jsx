import React from 'react';

const UIControls = ({
  referenceDate,
  onReferenceDateChange,
  timeWindowYears,
  onTimeWindowYearsChange,
  sources,
  activeSourceIds,
  onSourceFilterChange,
  onLoadSourceDataFiles,
  onSaveProfile,
  onLoadProfileFile,
  // Timeline control props
  onTimelineZoomIn,
  onTimelineZoomOut,
  onTimelinePanLeft,
  onTimelinePanRight,
  onTimelineResetZoom,
  onTimelinePeriodJump,
  // Date slider props
  minEventYear,
  maxEventYear,
}) => {

  const currentReferenceYear = referenceDate ? new Date(referenceDate).getFullYear() : new Date().getFullYear();

  const handleReferenceDateSliderChange = (event) => {
    const year = parseInt(event.target.value, 10);
    // Keep current month and day, or default to Jan 1 if not available
    // Ensure month is 1-based for Date constructor if day is also provided
    const currentMonthDate = referenceDate ? new Date(referenceDate) : new Date(year, 0, 1);
    const currentMonth = currentMonthDate.getMonth(); // 0-based
    const currentDay = currentMonthDate.getDate();
    
    // Check for valid date, especially for Feb 29
    const tempDate = new Date(year, currentMonth, currentDay);
    let dayToSet = currentDay;
    if (tempDate.getMonth() !== currentMonth) { // Month rolled over, day was invalid
        dayToSet = new Date(year, currentMonth + 1, 0).getDate(); // Last day of previous month (which is currentMonth)
    }


    const newDate = `${year}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayToSet).padStart(2, '0')}`;
    onReferenceDateChange(newDate);
  };

  const handleSourceDataFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      onLoadSourceDataFiles(Array.from(event.target.files));
      event.target.value = null; // Reset file input
    }
  };

  const handleProfileFileChange = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      onLoadProfileFile(event.target.files[0]);
      event.target.value = null; // Reset file input
    }
  };

  return (
    <div className="ui-controls-content">
      <h3>Controls</h3>
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h4>Data Management</h4>
        <div style={{ marginBottom: '5px' }}>
          <label htmlFor="source-data-file-input">Load Source Data (JSON): </label>
          <input
            type="file"
            id="source-data-file-input"
            multiple
            accept=".json"
            onChange={handleSourceDataFileChange}
          />
        </div>
        <div style={{ marginBottom: '5px' }}>
          <label htmlFor="profile-file-input">Load Profile (JSON): </label>
          <input
            type="file"
            id="profile-file-input"
            accept=".json"
            onChange={handleProfileFileChange}
          />
        </div>
        <button onClick={onSaveProfile} style={{ marginTop: '5px' }}>Save Profile</button>
      </div>
      <div>
        <label htmlFor="reference-date">Reference Date: </label>
        <input
          type="date"
          id="reference-date"
          name="reference-date"
          value={referenceDate}
          onChange={(e) => onReferenceDateChange(e.target.value)}
          style={{ marginBottom: '5px' }}
        />
        <input
          type="range"
          id="reference-date-slider"
          min={minEventYear || 1400} // Fallback if props not ready
          max={maxEventYear || new Date().getFullYear()} // Fallback
          value={currentReferenceYear}
          onChange={handleReferenceDateSliderChange}
          style={{ width: '100%', marginTop: '5px' }}
          title={`Year: ${currentReferenceYear}`}
        />
        <span style={{ fontSize: '0.9em', display: 'block', textAlign: 'center' }}>Year: {currentReferenceYear}</span>
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="time-window">Time Window (+/- years): </label>
        <input
          type="number"
          id="time-window"
          name="time-window"
          value={timeWindowYears}
          onChange={(e) => onTimeWindowYearsChange(parseInt(e.target.value, 10))}
          min="0"
        />
      </div>
      <div style={{ marginTop: '15px' }}>
        <h4>Source Filters</h4>
        {sources && sources.length > 0 ? (
          sources.map(source => (
            <div key={source.id} style={{ marginBottom: '5px' }}>
              <input
                type="checkbox"
                id={`source-filter-${source.id}`}
                name={source.name}
                checked={activeSourceIds.has(source.id)}
                onChange={(e) => onSourceFilterChange(source.id, e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              <label htmlFor={`source-filter-${source.id}`} title={source.description_short}>
                <span style={{ color: source.color || '#000000', fontWeight: 'bold' }}>■</span> {source.name}
              </label>
            </div>
          ))
        ) : (
          <p><em>No sources loaded to filter.</em></p>
        )}
      </div>

      <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <h4>Timeline Navigation</h4>
        <div style={{ marginBottom: '5px' }}>
          <button onClick={onTimelineZoomIn} title="Zoom In Timeline">Zoom In (+)</button>
          <button onClick={onTimelineZoomOut} title="Zoom Out Timeline" style={{ marginLeft: '5px' }}>Zoom Out (-)</button>
          <button onClick={onTimelineResetZoom} title="Reset Timeline Zoom" style={{ marginLeft: '5px' }}>Reset Zoom</button>
        </div>
        <div style={{ marginBottom: '5px' }}>
          <button onClick={onTimelinePanLeft} title="Pan Timeline Left">&larr; Pan Left</button>
          <button onClick={onTimelinePanRight} title="Pan Timeline Right" style={{ marginLeft: '5px' }}>Pan Right &rarr;</button>
        </div>
        <div>
          <label htmlFor="timeline-period-jump">Jump to Period: </label>
          <select id="timeline-period-jump" onChange={(e) => onTimelinePeriodJump(e.target.value)}>
            <option value="all">Full Range</option>
            <option value="1400-1500">Século XV (1400-1500)</option>
            <option value="1500-1600">Século XVI (1500-1600)</option>
            <option value="1600-1700">Século XVII (1600-1700)</option>
            <option value="1700-1800">Século XVIII (1700-1800)</option>
            <option value="1800-1900">Século XIX (1800-1900)</option>
            <option value="1900-2000">Século XX (1900-2000)</option>
            {/* Add more specific periods if needed, matching LDTBR's jumpToPeriod logic */}
          </select>
        </div>
      </div>

    </div>
  );
};

export default UIControls;