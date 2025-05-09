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
  // Timeline control props are removed
  // Date slider props (minEventYear, maxEventYear) are also removed as they were part of date controls
  // isTimelineLocked, onTimelineLockToggle are also removed
}) => {

  // currentReferenceYear and handleReferenceDateSliderChange are removed as they were part of date controls

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
      {/* Date and Time Window controls have been moved to DateControls.jsx */}
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
      {/* Timeline Navigation controls removed as per user request, D3 handles direct interaction */}
    </div>
  );
};

export default UIControls;