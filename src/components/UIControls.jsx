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
  availableMapStyles,
  currentMapStyleUrl,
  onMapStyleChange,
  dataSources, // New prop for predefined data sources
  selectedDataSourceId, // New prop for the currently selected data source ID
  onDataSourceChange, // New prop for handling data source change
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
        <button onClick={onSaveProfile}>Salvar Perfil</button> {/* Removed inline style */}
      </div>

      {dataSources && dataSources.length > 0 && (
        <div style={{ marginTop: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <h4>Selecionar Fonte de Dados Principal</h4>
          <label htmlFor="data-source-select">Escolha uma fonte de dados: </label>
          <select
            id="data-source-select"
            value={selectedDataSourceId || ''}
            onChange={(e) => onDataSourceChange(e.target.value)}
            style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            {dataSources.map(source => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h4>Estilo do Mapa</h4>
        <label htmlFor="map-style-select">Escolha um estilo: </label>
        <select
          id="map-style-select"
          value={currentMapStyleUrl}
          onChange={(e) => onMapStyleChange(e.target.value)}
          style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        >
          {availableMapStyles && availableMapStyles.map(style => (
            <option key={style.url} value={style.url}>
              {style.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date and Time Window controls have been moved to DateControls.jsx */}

      <div style={{ marginTop: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h4>Controles da Linha do Tempo</h4>
        <button onClick={onToggleTimelineExpanded}> {/* Removed inline style */}
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
              <button onClick={() => onSetTimelineZoomLevel('decade')} style={{marginRight: '5px'}}>Visão Década</button> {/* Kept marginRight for layout */}
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