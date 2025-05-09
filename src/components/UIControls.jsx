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
  isTimelineLocked, // This prop was missing in the previous App.jsx diff, but is used
  onTimelineLockToggle, // This prop was missing in the previous App.jsx diff, but is used
  isTimelineExpanded,
  onToggleTimelineExpanded,
  onJumpToYear,
  onSetTimelineZoomLevel,
}) => {

  // Placeholder for jump to year input
  const [jumpYear, setJumpYear] = React.useState('');

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
      <h3>Controles</h3>
      <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h4>Gerenciamento de Dados</h4>
        <div style={{ marginBottom: '5px' }}>
          <label htmlFor="source-data-file-input">Carregar Dados de Fonte (JSON): </label>
          <input
            type="file"
            id="source-data-file-input"
            multiple
            accept=".json"
            onChange={handleSourceDataFileChange}
          />
        </div>
        <div style={{ marginBottom: '5px' }}>
          <label htmlFor="profile-file-input">Carregar Perfil (JSON): </label>
          <input
            type="file"
            id="profile-file-input"
            accept=".json"
            onChange={handleProfileFileChange}
          />
        </div>
        <button onClick={onSaveProfile} style={{ marginTop: '5px' }}>Salvar Perfil</button>
      </div>
      {/* Date and Time Window controls have been moved to DateControls.jsx */}

      <div style={{ marginTop: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h4>Controles da Linha do Tempo</h4>
        <button onClick={onToggleTimelineExpanded} style={{ marginBottom: '10px' }}>
          {isTimelineExpanded ? 'Recolher Linha do Tempo' : 'Expandir Linha do Tempo'}
        </button>
        {isTimelineExpanded && (
          <div className="expanded-timeline-controls">
            <div>
              <label htmlFor="jump-to-year-input">Saltar para Ano: </label>
              <input
                type="number"
                id="jump-to-year-input"
                value={jumpYear}
                onChange={(e) => setJumpYear(e.target.value)}
                placeholder="Ano"
                style={{width: '70px', marginRight: '5px'}}
              />
              <button onClick={() => onJumpToYear(jumpYear)}>Ir</button>
            </div>
            <div style={{marginTop: '5px'}}>
              <button onClick={() => onSetTimelineZoomLevel('decade')} style={{marginRight: '5px'}}>Visão Década</button>
              <button onClick={() => onSetTimelineZoomLevel('century')}>Visão Século</button>
            </div>
          </div>
        )}
        {/* Timeline Lock Toggle - Assuming it stays here or is managed alongside expand */}
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
            <input
                type="checkbox"
                id="timeline-lock-toggle"
                checked={isTimelineLocked}
                onChange={onTimelineLockToggle}
                disabled={isTimelineExpanded} // Disable lock when timeline is expanded (as it's auto-unlocked)
                style={{ marginRight: '5px' }}
            />
            <label htmlFor="timeline-lock-toggle">
                Travar Linha do Tempo no Centro (Data de Ref.)
            </label>
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <h4>Filtros de Fonte</h4>
        {sources && sources.length > 0 ? (
          sources.map(source => (
            <div key={source.id} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
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
          <p><em>Nenhuma fonte carregada para filtrar.</em></p>
        )}
      </div>
      {/* Removed "Filtros de Exibição da Lista" section */}
    </div>
  );
};

export default UIControls;