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
  // filterEntitiesByTimeWindow, // Removed
  // onToggleFilterEntitiesByTimeWindow, // Removed
}) => {

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