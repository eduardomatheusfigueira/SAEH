import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as DataManager from '../dataManager';

const DataManagementPage = ({
  allSources = [],
  allEvents = [],
  allCharacters = [],
  allPlaces = [],
  allThemes = [],
  handleSaveProfile,
  handleLoadProfileFile,
  onDataChange,
  currentUiTheme = {}, // Accept currentUiTheme prop with a default
}) => {
  const [activeTab, setActiveTab] = useState('sources');
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);
  const [formData, setFormData] = useState({});
  const [isDiagnosticsVisible, setIsDiagnosticsVisible] = useState(false); // New state for diagnostics visibility

  const tabDisplayNames = {
    sources: 'Fontes',
    events: 'Eventos',
    characters: 'Personagens',
    places: 'Locais',
    themes: 'Temas',
  };

  const pageStyle = {
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column',
    gap: '20px',
    height: 'calc(100vh - 40px)',
    backgroundColor: currentUiTheme['--main-bg-color'] || '#f0f2f5',
    color: currentUiTheme['--text-color'] || '#333333'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: currentUiTheme['--panel-background'] || '#ffffff',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: currentUiTheme['--panel-shadow'] || '0 4px 12px rgba(0,0,0,0.15)'
  };

  const navStyle = {
    display: 'flex',
    backgroundColor: currentUiTheme['--panel-background'] || '#ffffff',
    borderRadius: '8px',
    padding: '0px 5px',
    boxShadow: currentUiTheme['--panel-shadow'] || '0 2px 5px rgba(0,0,0,0.05)',
    gap: '5px'
  };
  
  const filterPanelStyle = {
    padding: '15px 20px',
    backgroundColor: currentUiTheme['--panel-background'] || '#ffffff',
    borderRadius: '0 0 8px 8px',
    border: `1px solid ${currentUiTheme['--border-color'] || '#cccccc'}`,
    borderTop: 'none',
    boxShadow: currentUiTheme['--panel-shadow'] || '0 2px 5px rgba(0,0,0,0.05)',
    marginTop: '-1px'
  };
  
  const panelStyle = { // Base for list/detail panes
    backgroundColor: currentUiTheme['--panel-background'] || '#ffffff',
    color: currentUiTheme['--text-color'] || '#333333',
    border: `1px solid ${currentUiTheme['--border-color'] || '#cccccc'}`,
    padding: '15px',
    borderRadius: '8px',
    boxShadow: currentUiTheme['--panel-shadow'] || '0 4px 12px rgba(0,0,0,0.2)'
  };

  const listPaneStyle = {
    ...panelStyle,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  const detailPaneStyle = {
    ...panelStyle,
    flex: 2,
    overflowY: 'auto',
    padding: '20px'
  };

  const commonInputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: currentUiTheme['--input-bg-color'] || '#ffffff',
    color: currentUiTheme['--text-color'] || '#333333',
    border: `1px solid ${currentUiTheme['--border-color'] || '#cccccc'}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '0.95em'
  };

  const commonLabelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: currentUiTheme['--text-color'] || '#333333',
    fontWeight: '500',
    fontSize: '0.9em'
  };
  
  const commonSelectStyle = {
    ...commonInputStyle // This will also use the direct theme values now
  };
  
  const baseButtonStyle = { // Buttons can still use CSS vars as they might be more consistently applied
    padding: '8px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9em',
    transition: 'background-color 0.2s ease, opacity 0.2s ease',
    lineHeight: '1.5'
  };

  const primaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--button-primary-bg, #007bff)',
    color: 'var(--button-primary-text, #ffffff)',
  };

  const secondaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--button-secondary-bg, #6c757d)',
    color: 'var(--button-secondary-text, #ffffff)',
  };
  
  const dangerButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'var(--danger-color, #dc3545)',
    color: 'var(--button-primary-text, #ffffff)',
  };

  const tabButtonStyle = (currentActiveTabParam) => ({ // Renamed param to avoid conflict with state 'activeTab'
    padding: '10px 18px',
    border: 'none',
    borderBottom: currentActiveTabParam === activeTab ? `3px solid ${currentUiTheme['--button-primary-bg'] || '#007bff'}` : '3px solid transparent',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: currentActiveTabParam === activeTab ? (currentUiTheme['--button-primary-bg'] || '#007bff') : (currentUiTheme['--text-color-muted'] || '#6c757d'),
    fontWeight: currentActiveTabParam === activeTab ? 'bold' : '500',
    transition: 'color 0.2s ease, border-bottom-color 0.2s ease',
    fontSize: '1em',
    textTransform: 'capitalize',
    outline: 'none',
    marginRight: '2px'
  });

  useEffect(() => {
    let currentList = [];
    switch (activeTab) {
      case 'sources': currentList = allSources; break;
      case 'events': currentList = selectedSourceId ? allEvents.filter(e => e.sourceId === selectedSourceId) : allEvents; break;
      case 'characters': currentList = selectedSourceId ? allCharacters.filter(c => c.sourceId === selectedSourceId) : allCharacters; break;
      case 'places': currentList = selectedSourceId ? allPlaces.filter(p => p.sourceId === selectedSourceId) : allPlaces; break;
      case 'themes': currentList = allThemes; break;
      default: currentList = [];
    }
    setItemList(currentList);
  }, [activeTab, selectedSourceId, allSources, allEvents, allCharacters, allPlaces, allThemes]);

  useEffect(() => {
    setSelectedItem(null);
    setIsCreatingNewItem(false);
    setFormData({}); 
  }, [activeTab, selectedSourceId]);

  useEffect(() => {
    if (isCreatingNewItem) {
      let defaultData = {};
      const commonNewId = `new_${Date.now()}`; 
      const defaultSourceId = selectedSourceId || (allSources.length > 0 ? allSources[0].id : null);

      switch (activeTab) {
        case 'sources':
          defaultData = { name: "Nova Fonte", author: "", color: "#CCCCCC", description_short: "", article_full: { current: "" } };
          break;
        case 'events':
          defaultData = { title: "Novo Evento", date_type: "single", start_date: new Date().toISOString().split('T')[0], end_date: null, characters_ids: [], place_id: "", longitude: null, latitude: null, main_theme_id: "", secondary_tags_ids: [], description_short: "", article_full: { current: "" }, sourceId: defaultSourceId };
          break;
        case 'characters':
          defaultData = { name: "Novo Personagem", description_short: "", article_full: { current: "" }, sourceId: defaultSourceId };
          break;
        case 'places':
          defaultData = { name: "Novo Local", description_short: "", longitude: null, latitude: null, article_full: { current: "" }, sourceId: defaultSourceId };
          break;
        case 'themes':
          defaultData = { name: "Novo Tema", color: "#808080", description_short: "", article_full: { current: "" } };
          break;
        default: break;
      }
      setFormData(defaultData);
      setSelectedItem({ ...defaultData, id: commonNewId }); 
    } else if (selectedItem) {
      const currentFormData = { ...selectedItem };
      if (activeTab === 'events') {
        currentFormData.characters_ids = Array.isArray(selectedItem.characters_ids) ? selectedItem.characters_ids.join(', ') : (selectedItem.characters_ids || '');
        currentFormData.secondary_tags_ids = Array.isArray(selectedItem.secondary_tags_ids) ? selectedItem.secondary_tags_ids.join(', ') : (selectedItem.secondary_tags_ids || '');
      }
      setFormData(currentFormData);
    } else {
      setFormData({});
    }
  }, [selectedItem, isCreatingNewItem, activeTab, selectedSourceId, allSources]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "article_full_current") {
      setFormData(prev => ({ ...prev, article_full: { ...prev.article_full, current: value } }));
    } else if (name === "longitude" || name === "latitude") {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : parseFloat(value) }));
    } else if (name === "characters_ids" || name === "secondary_tags_ids") {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === "date_type") {
      setFormData(prev => ({ ...prev, [name]: value, end_date: value === "single" ? null : (prev.end_date || prev.start_date || new Date().toISOString().split('T')[0]) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddNewItem = () => {
    setIsCreatingNewItem(true);
    setSelectedItem(null); 
  };

  const handleProfileFileChange = (event) => {
    if (event.target.files && event.target.files.length === 1) {
      if (handleLoadProfileFile) handleLoadProfileFile(event.target.files[0]);
      event.target.value = null;
    }
  };

  const getDisplayKey = (item) => item.globalId || item.id || `item-${Math.random()}`;

  const handleSave = () => {
    let success = false;
    const dataToSave = { ...formData };

    if (isCreatingNewItem) {
      switch (activeTab) {
        case 'sources':
          const newSourceId = DataManager.addSource(dataToSave);
          if (newSourceId) { console.log("Nova fonte:", newSourceId, dataToSave); success = true; }
          break;
        case 'events':
          dataToSave.characters_ids = typeof dataToSave.characters_ids === 'string' ? dataToSave.characters_ids.split(',').map(id => id.trim()).filter(id => id) : [];
          dataToSave.secondary_tags_ids = typeof dataToSave.secondary_tags_ids === 'string' ? dataToSave.secondary_tags_ids.split(',').map(id => id.trim()).filter(id => id) : [];
          if (!dataToSave.sourceId) { alert("Por favor, selecione uma fonte para o evento."); return; }
          const newEventGlobalId = DataManager.addEventToSource(dataToSave.sourceId, dataToSave);
          if (newEventGlobalId) { console.log("Novo evento:", newEventGlobalId, dataToSave); success = true; }
          break;
        case 'characters':
          if (!dataToSave.sourceId) { alert("Por favor, selecione uma fonte para o personagem."); return; }
          const newCharGlobalId = DataManager.addCharacterToSource(dataToSave.sourceId, dataToSave);
          if (newCharGlobalId) { console.log("Novo personagem:", newCharGlobalId, dataToSave); success = true; }
          break;
        case 'places':
          if (!dataToSave.sourceId) { alert("Por favor, selecione uma fonte para o local."); return; }
          const newPlaceGlobalId = DataManager.addPlaceToSource(dataToSave.sourceId, dataToSave);
          if (newPlaceGlobalId) { console.log("Novo local:", newPlaceGlobalId, dataToSave); success = true; }
          break;
        case 'themes':
          const newThemeId = DataManager.addTheme(dataToSave);
          if (newThemeId) { console.log("Novo tema:", newThemeId, dataToSave); success = true; }
          break;
        default: break;
      }
    } else if (selectedItem) { 
      switch (activeTab) {
        case 'sources':
          if (DataManager.updateSourceInfo(selectedItem.id, dataToSave)) { console.log("Fonte atualizada:", selectedItem.id, dataToSave); success = true; }
          break;
        case 'events':
          dataToSave.characters_ids = typeof dataToSave.characters_ids === 'string' ? dataToSave.characters_ids.split(',').map(id => id.trim()).filter(id => id) : [];
          dataToSave.secondary_tags_ids = typeof dataToSave.secondary_tags_ids === 'string' ? dataToSave.secondary_tags_ids.split(',').map(id => id.trim()).filter(id => id) : [];
          if (DataManager.updateEventInSource(selectedItem.globalId, dataToSave)) { console.log("Evento atualizado:", selectedItem.globalId, dataToSave); success = true; }
          break;
        case 'characters':
          if (DataManager.updateCharacterInSource(selectedItem.globalId, dataToSave)) { console.log("Personagem atualizado:", selectedItem.globalId, dataToSave); success = true; }
          break;
        case 'places':
          if (DataManager.updatePlaceInSource(selectedItem.globalId, dataToSave)) { console.log("Local atualizado:", selectedItem.globalId, dataToSave); success = true; }
          break;
        case 'themes':
          if (DataManager.updateTheme(selectedItem.id, dataToSave)) { console.log("Tema atualizado:", selectedItem.id, dataToSave); success = true; }
          break;
        default: break;
      }
    }

    if (success) {
      if (onDataChange) onDataChange();
      alert(`${activeTab.slice(0,-1)} ${isCreatingNewItem ? 'adicionado(a)' : 'atualizado(a)'}!`);
      setIsCreatingNewItem(false); 
      setSelectedItem(null); 
    } else {
      alert(`Erro ao salvar ${activeTab.slice(0,-1)}. Verifique o console.`);
    }
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    let success = false;
    const itemName = selectedItem.name || selectedItem.title || selectedItem.id;
    if (!confirm(`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`)) return;

    switch (activeTab) {
      case 'sources':
        if (DataManager.removeSource(selectedItem.id)) { console.log("Fonte removida:", selectedItem.id); success = true; }
        break;
      case 'events':
        if (DataManager.deleteEventFromSource(selectedItem.globalId)) { console.log("Evento removido:", selectedItem.globalId); success = true; }
        break;
      case 'characters':
        if (DataManager.deleteCharacterFromSource(selectedItem.globalId)) { console.log("Personagem removido:", selectedItem.globalId); success = true; }
        break;
      case 'places':
        if (DataManager.deletePlaceFromSource(selectedItem.globalId)) { console.log("Local removido:", selectedItem.globalId); success = true; }
        break;
      case 'themes':
        if (DataManager.deleteTheme(selectedItem.id)) { console.log("Tema removido:", selectedItem.id); success = true; }
        break;
      default: break;
    }
    if (success) {
      if (onDataChange) onDataChange(); 
      alert(`${activeTab.slice(0,-1)} excluído(a)!`);
      setSelectedItem(null); 
      setIsCreatingNewItem(false);
    } else {
      alert(`Erro ao excluir ${activeTab.slice(0,-1)}. Verifique o console.`);
    }
  };

  const renderListPane = () => (
    <div className="list-pane" style={listPaneStyle}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h4 style={{ margin: 0, color: currentUiTheme['--text-color'] || 'var(--text-color)' }}>Lista de {tabDisplayNames[activeTab] || activeTab}</h4>
          {activeTab === 'events' && (
            <button
              onClick={() => setIsDiagnosticsVisible(!isDiagnosticsVisible)}
              title={isDiagnosticsVisible ? "Ocultar Diagnóstico" : "Mostrar Diagnóstico"}
              style={{...baseButtonStyle, padding: '4px 8px', fontSize: '0.8em', backgroundColor: 'var(--button-secondary-bg, #6c757d)', color: 'var(--button-secondary-text, white)'}}
            >
              {isDiagnosticsVisible ? 'Ocultar Diag.' : 'Diag.'}
            </button>
          )}
        </div>
        <button
          onClick={handleAddNewItem}
          style={secondaryButtonStyle}
        >
          Adicionar Novo(a)
        </button>
      </div>
      <div style={{flexGrow: 1, overflowY: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginRight: '-15px', paddingRight: '15px'}}>
        {itemList.map(item => (
          <div
            key={getDisplayKey(item)}
            onClick={() => { setSelectedItem(item); setIsCreatingNewItem(false); }}
            style={{
              cursor: 'pointer',
              padding: '10px 12px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: selectedItem && (getDisplayKey(selectedItem) === getDisplayKey(item)) ? 'var(--highlight-bg-color, var(--button-primary-bg))' : 'transparent',
              color: selectedItem && (getDisplayKey(selectedItem) === getDisplayKey(item)) ? 'var(--button-primary-text, white)' : 'var(--text-color)',
              borderRadius: '4px',
              marginBottom: '5px',
              transition: 'background-color 0.2s ease, color 0.2s ease'
            }}
          >
            {item.name || item.title || item.id}
          </div>
        ))}
        {itemList.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-color-muted, #6c757d)', marginTop: '20px'}}>Nenhum item para exibir para {activeTab}.</p>}
      </div>

      {activeTab === 'events' && isDiagnosticsVisible && (
        <div style={{ marginTop: '15px', fontSize: '0.9em', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', color: 'var(--text-color-muted, #6c757d)' }}>
          <p><strong>Diagnóstico de Eventos:</strong></p>
          <p>Selected Source ID: <code>{selectedSourceId || "Nenhum (mostrando todos)"}</code></p>
          <p>Total de eventos carregados (allEvents): {allEvents.length}</p>
          {selectedSourceId && (
            <p>
              Eventos correspondendo ao Source ID selecionado: {allEvents.filter(e => e.sourceId === selectedSourceId).length}
            </p>
          )}
          {allEvents.length > 0 && (
            <div>
              <p>Amostra de eventos (até 3) e seus sourceIds:</p>
              <ul style={{paddingLeft: '20px', listStyle: 'disc'}}>
                {allEvents.slice(0, 3).map((e, idx) => (
                  <li key={`diag-evt-${idx}`}>"{e.title}" - sourceId: <code>{e.sourceId === undefined ? 'undefined' : JSON.stringify(e.sourceId)}</code></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDetailEditPane = () => {
    const itemForForm = formData; 
    const currentSelectedItemForContext = selectedItem; 

    if (!currentSelectedItemForContext && !isCreatingNewItem) {
      return <div className="detail-pane" style={{ ...detailPaneStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color-muted, #6c757d)' }}>Selecione um item da lista ou clique em "Adicionar Novo".</div>;
    }
    
    const titlePrefix = isCreatingNewItem ? "Criar Novo(a)" : `Detalhes / Editar ${tabDisplayNames[activeTab]?.slice(0,-1) || activeTab.slice(0,-1)}`;
    const displayName = isCreatingNewItem
      ? (itemForForm.name || itemForForm.title || (tabDisplayNames[activeTab]?.slice(0,-1) || activeTab.slice(0,-1)))
      : (currentSelectedItemForContext?.name || currentSelectedItemForContext?.title || currentSelectedItemForContext?.id);

    const commonFormFields = (
      <>
        <div style={{marginBottom: '15px'}}>
          <label htmlFor="itemName" style={commonLabelStyle}>Nome/Título:</label>
          <input type="text" id="itemName" name={activeTab === 'events' || activeTab === 'themes' ? 'title' : 'name'} value={itemForForm.name || itemForForm.title || ''} onChange={handleFormChange} style={commonInputStyle} />
        </div>
        <div style={{marginBottom: '15px'}}>
          <label htmlFor="itemDescShort" style={commonLabelStyle}>Descrição Curta:</label>
          <textarea id="itemDescShort" name="description_short" value={itemForForm.description_short || ''} onChange={handleFormChange} rows="3" style={commonInputStyle} />
        </div>
        <div style={{marginBottom: '15px'}}>
          <label htmlFor="itemArticleFull" style={commonLabelStyle}>Artigo Completo (Markdown):</label>
          <textarea id="itemArticleFull" name="article_full_current" value={itemForForm.article_full?.current || ''} onChange={handleFormChange} rows="8" style={commonInputStyle} />
        </div>
      </>
    );

    const sourceIdField = (isCreatingNewItem && (activeTab === 'events' || activeTab === 'characters' || activeTab === 'places')) && (
      <div style={{marginBottom: '15px'}}>
        <label htmlFor="itemSourceId" style={commonLabelStyle}>Fonte:</label>
          <select id="itemSourceId" name="sourceId" value={itemForForm.sourceId || ''} onChange={handleFormChange} style={commonSelectStyle} required>
            <option value="" disabled>Selecione uma Fonte</option>
            {allSources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
      </div>
    );
    
    return (
      <div className="detail-pane" style={detailPaneStyle}>
        <h4 style={{marginTop: 0, color: 'var(--text-color)', marginBottom: '20px'}}>{titlePrefix} {displayName}</h4>
        
        <form onSubmit={(e) => e.preventDefault()}>
          {activeTab === 'sources' && (
            <>
              {commonFormFields}
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="sourceAuthor" style={commonLabelStyle}>Autor:</label>
                <input type="text" id="sourceAuthor" name="author" value={itemForForm.author || ''} onChange={handleFormChange} style={commonInputStyle} />
              </div>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="sourceColor" style={commonLabelStyle}>Cor:</label>
                <input type="color" id="sourceColor" name="color" value={itemForForm.color || '#CCCCCC'} onChange={handleFormChange} style={{padding: '2px', border: '1px solid var(--border-color)', borderRadius: '4px', height: '40px', width: '60px', boxSizing: 'content-box'}}/>
              </div>
            </>
          )}

          {activeTab === 'events' && (
            <>
              {commonFormFields}
              <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                <div style={{flex: 1}}>
                  <label htmlFor="eventDateType" style={commonLabelStyle}>Tipo de Data:</label>
                  <select id="eventDateType" name="date_type" value={itemForForm.date_type || 'single'} onChange={handleFormChange} style={commonSelectStyle}>
                    <option value="single">Única</option>
                    <option value="period">Período</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label htmlFor="eventStartDate" style={commonLabelStyle}>Data Início:</label>
                  <input type="date" id="eventStartDate" name="start_date" value={itemForForm.start_date || ''} onChange={handleFormChange} style={{...commonInputStyle, width: '100%'}} />
                </div>
                {itemForForm.date_type === 'period' && (
                  <div style={{flex: 1}}>
                    <label htmlFor="eventEndDate" style={commonLabelStyle}>Data Fim:</label>
                    <input type="date" id="eventEndDate" name="end_date" value={itemForForm.end_date || ''} onChange={handleFormChange} style={{...commonInputStyle, width: '100%'}} />
                  </div>
                )}
              </div>
              <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                <div style={{flex: 1}}>
                  <label htmlFor="eventLongitude" style={commonLabelStyle}>Longitude:</label>
                  <input type="number" step="any" id="eventLongitude" name="longitude" value={itemForForm.longitude === null || itemForForm.longitude === undefined ? '' : itemForForm.longitude} onChange={handleFormChange} style={commonInputStyle} />
                </div>
                <div style={{flex: 1}}>
                  <label htmlFor="eventLatitude" style={commonLabelStyle}>Latitude:</label>
                  <input type="number" step="any" id="eventLatitude" name="latitude" value={itemForForm.latitude === null || itemForForm.latitude === undefined ? '' : itemForForm.latitude} onChange={handleFormChange} style={commonInputStyle} />
                </div>
              </div>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="eventChars" style={commonLabelStyle}>Personagens (IDs, sep. por vírgula):</label>
                <input type="text" id="eventChars" name="characters_ids" value={itemForForm.characters_ids || ''} onChange={handleFormChange} style={commonInputStyle} />
                <div style={{fontSize: '0.85em', marginTop: '5px', color: 'var(--text-color-muted, #6c757d)'}}>
                  { (itemForForm.characters_ids && typeof itemForForm.characters_ids === 'string') &&
                    itemForForm.characters_ids.split(',').map(id => id.trim()).filter(id => id).map(id => {
                      const char = allCharacters.find(c => c.globalId === id || c.id === id);
                      return char ? <span key={id} style={{marginRight: '5px', padding:'2px 5px', backgroundColor: 'var(--highlight-bg-color-subtle, #dddddd)', color: 'var(--text-color)', borderRadius: '3px'}}>{char.name}</span> : <span key={id} style={{marginRight: '5px', color: 'var(--danger-color, red)'}}>ID: {id} (não encontrado)</span>;
                    })
                  }
                </div>
              </div>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="eventPlace" style={commonLabelStyle}>Local:</label>
                <select id="eventPlace" name="place_id" value={itemForForm.place_id || ''} onChange={handleFormChange} style={commonSelectStyle}>
                  <option value="">Nenhum</option>
                  {allPlaces.map(p => <option key={p.globalId || p.id} value={p.globalId || p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="eventMainTheme" style={commonLabelStyle}>Tema Principal:</label>
                 <select id="eventMainTheme" name="main_theme_id" value={itemForForm.main_theme_id || ''} onChange={handleFormChange} style={commonSelectStyle}>
                  <option value="">Nenhum</option>
                  {allThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="eventSecTags" style={commonLabelStyle}>Tags Secundárias (IDs, sep. por vírgula):</label>
                <input type="text" id="eventSecTags" name="secondary_tags_ids" value={itemForForm.secondary_tags_ids || ''} onChange={handleFormChange} style={commonInputStyle} />
                 <div style={{fontSize: '0.85em', marginTop: '5px', color: 'var(--text-color-muted, #6c757d)'}}>
                  { (itemForForm.secondary_tags_ids && typeof itemForForm.secondary_tags_ids === 'string') &&
                    itemForForm.secondary_tags_ids.split(',').map(id => id.trim()).filter(id => id).map(id => {
                      const theme = allThemes.find(t => t.id === id);
                      return theme ? <span key={id} style={{marginRight: '5px', padding:'2px 5px', backgroundColor: theme.color || 'var(--highlight-bg-color-subtle, #dddddd)', color: theme.color ? 'white': 'var(--text-color)', borderRadius: '3px'}}>{theme.name}</span> : <span key={id} style={{marginRight: '5px', color: 'var(--danger-color, red)'}}>ID: {id} (não encontrado)</span>;
                    })
                  }
                </div>
              </div>
              {sourceIdField}
            </>
          )}

          {activeTab === 'characters' && (
            <>
              {commonFormFields}
              {sourceIdField}
            </>
          )}

          {activeTab === 'places' && (
            <>
              {commonFormFields}
              <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                <div style={{flex: 1}}>
                  <label htmlFor="placeLongitude" style={commonLabelStyle}>Longitude:</label>
                  <input type="number" step="any" id="placeLongitude" name="longitude" value={itemForForm.longitude === null || itemForForm.longitude === undefined ? '' : itemForForm.longitude} onChange={handleFormChange} style={commonInputStyle} />
                </div>
                <div style={{flex: 1}}>
                  <label htmlFor="placeLatitude" style={commonLabelStyle}>Latitude:</label>
                  <input type="number" step="any" id="placeLatitude" name="latitude" value={itemForForm.latitude === null || itemForForm.latitude === undefined ? '' : itemForForm.latitude} onChange={handleFormChange} style={commonInputStyle} />
                </div>
              </div>
              {sourceIdField}
            </>
          )}

          {activeTab === 'themes' && (
             <>
              {commonFormFields}
              <div style={{marginBottom: '15px'}}>
                <label htmlFor="themeColor" style={commonLabelStyle}>Cor:</label>
                <input type="color" id="themeColor" name="color" value={itemForForm.color || '#808080'} onChange={handleFormChange} style={{padding: '2px', border: '1px solid var(--border-color)', borderRadius: '4px', height: '40px', width: '60px', boxSizing: 'content-box'}}/>
              </div>
            </>
          )}
        </form>
        
        {(isCreatingNewItem || currentSelectedItemForContext) && (
          <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)'}}>
            <button onClick={handleSave} style={{...primaryButtonStyle, marginRight: '10px'}}>
              {isCreatingNewItem ? `Salvar Novo ${activeTab.slice(0,-1)}` : 'Salvar Alterações'}
            </button>
            {isCreatingNewItem && (
              <button onClick={() => { setIsCreatingNewItem(false); setSelectedItem(null); setFormData({}); }} style={secondaryButtonStyle}>Cancelar</button>
            )}
            {!isCreatingNewItem && currentSelectedItemForContext && (
              <button onClick={handleDelete} style={dangerButtonStyle}>
                Excluir Item
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="data-management-page" style={pageStyle}>
      <header style={headerStyle}>
        <Link
          to="/"
          style={{
            ...baseButtonStyle,
            backgroundColor: currentUiTheme['--button-primary-bg'] || 'var(--button-primary-bg, #007bff)',
            color: currentUiTheme['--button-primary-text'] || 'var(--button-primary-text, #ffffff)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 15px', // Ensure adequate padding like a button
            fontSize: '1em' // Match other primary buttons if needed
          }}
        >
          &larr; Voltar à Visualização Principal
        </Link>
        <h2 style={{margin: 0, color: currentUiTheme['--text-color'] || 'var(--text-color)', fontSize: '1.4em'}}>Gerenciamento de Dados</h2>
        <div>
          <input
            type="file"
            id="load-profile-dmp"
            accept=".json"
            onChange={handleProfileFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="load-profile-dmp" style={{ ...secondaryButtonStyle, marginRight: '10px' }}>
            Carregar Perfil
          </label>
          <button onClick={handleSaveProfile} style={primaryButtonStyle}>Salvar Perfil Completo</button>
        </div>
      </header>

      <nav style={navStyle}>
        {Object.keys(tabDisplayNames).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            style={tabButtonStyle(tabKey)}
          >
            {tabDisplayNames[tabKey]}
          </button>
        ))}
      </nav>

      {activeTab !== 'sources' && activeTab !== 'themes' && (
        <div className="source-filter-section" style={{...filterPanelStyle, marginTop: (activeTab === 'sources' || activeTab === 'themes') ? '0px' : '-8px' , borderRadius: '0 0 8px 8px', borderTop: 'none' }}>
          <label htmlFor="source-select" style={{color: 'var(--text-color)', marginRight: '10px', fontWeight: '500', fontSize: '0.9em'}}>Filtrar por Fonte: </label>
          <select
            id="source-select"
            value={selectedSourceId}
            onChange={(e) => setSelectedSourceId(e.target.value)}
            style={{...commonSelectStyle, minWidth: '300px', display: 'inline-block', width: 'auto' }}
          >
            <option value="">Todas as Fontes Carregadas</option>
            {allSources.map(source => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="main-content-area" style={{ display: 'flex', gap: '20px', flexGrow: 1, overflow: 'hidden', marginTop: (activeTab === 'sources' || activeTab === 'themes') ? '0px' : '0px' }}>
        {renderListPane()}
        {renderDetailEditPane()}
      </div>

      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '15px', paddingBottom:'10px', textAlign: 'center', color: 'var(--text-color-muted, #6c757d)', fontSize: '0.9em' }}>
        <p>Interface de Gerenciamento de Dados SAEH</p>
      </footer>
    </div>
  );
};

export default DataManagementPage;