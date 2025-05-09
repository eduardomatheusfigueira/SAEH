import React, { useState, useEffect, useRef, useMemo } from 'react';
import MapView from './components/MapView';
import TimelineView from './components/TimelineView';
import UIControls from './components/UIControls';
import DetailModal from './components/DetailModal';
import EntityListView from './components/EntityListView';
import TimelineLegend from './components/TimelineLegend';
import DateControls from './components/DateControls';
import * as DataManager from './dataManager';
import { MAPBOX_ACCESS_TOKEN } from './config';

function App() {
  const [minEventYear, setMinEventYear] = useState(1400);
  const [maxEventYear, setMaxEventYear] = useState(new Date().getFullYear());
  const [allLoadedEvents, setAllLoadedEvents] = useState([]);
  const [themes, setThemes] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [allCharacters, setAllCharacters] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [activeSourceIds, setActiveSourceIds] = useState(new Set());
  const [referenceDate, setReferenceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeWindowYears, setTimeWindowYears] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntityData, setSelectedEntityData] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timelineViewRef = useRef(null);
  const [isTimelineLockedToCenter, setIsTimelineLockedToCenter] = useState(false);
  const [isControlsPanelVisible, setIsControlsPanelVisible] = useState(true);

  const toggleControlsPanel = () => setIsControlsPanelVisible(!isControlsPanelVisible);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const response = await fetch('/data/example_source_data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const jsonData = await response.json();
        if (DataManager.loadSourceDataFromString(JSON.stringify(jsonData), 'example_source_data.json')) {
          const sources = DataManager.getSourcesInfo();
          const events = DataManager.getAllEvents();
          setAllLoadedEvents(events);
          setThemes(DataManager.getAllThemes());
          setAllSources(sources);
          setAllCharacters(DataManager.getAllCharacters());
          setAllPlaces(DataManager.getAllPlaces());
          setActiveSourceIds(new Set(sources.map(s => s.id)));
          if (events.length > 0) {
            const years = events.map(e => new Date(e.start_date).getFullYear());
            setMinEventYear(Math.min(...years));
            setMaxEventYear(Math.max(...years));
          }
        }
      } catch (error) { console.error("Could not load initial example data:", error); }
      finally { setIsLoading(false); }
    }
    loadInitialData();
  }, []);

  const handleSourceFilterChange = (sourceId, isActive) => {
    setActiveSourceIds(prev => {
      const newActive = new Set(prev);
      if (isActive) newActive.add(sourceId); else newActive.delete(sourceId);
      return newActive;
    });
  };

  const handleLoadSourceDataFiles = async (files) => {
    setIsLoading(true);
    for (const file of files) {
      try {
        const jsonString = await file.text();
        if (!DataManager.loadSourceDataFromString(jsonString, file.name)) {
          console.error(`Failed to process data from file: ${file.name}`);
        }
      } catch (error) {
        alert(`Erro: Não foi possível ler o arquivo ${file.name}. \nDetalhes: ${error.message}`);
      }
    }
    const sources = DataManager.getSourcesInfo();
    const currentLoadedEvents = DataManager.getAllEvents();
    setAllLoadedEvents(currentLoadedEvents);
    setThemes(DataManager.getAllThemes());
    setAllSources(sources);
    setAllCharacters(DataManager.getAllCharacters());
    setAllPlaces(DataManager.getAllPlaces());
    if (currentLoadedEvents.length > 0) {
      const years = currentLoadedEvents.map(e => new Date(e.start_date).getFullYear());
      setMinEventYear(Math.min(...years));
      setMaxEventYear(Math.max(...years));
    } else {
      setMinEventYear(1400); setMaxEventYear(new Date().getFullYear());
    }
    setActiveSourceIds(new Set(sources.map(s => s.id)));
    setIsLoading(false);
  };

  const handleSaveProfile = () => {
    const profileName = prompt("Digite um nome para este perfil:", "SAEH_Perfil");
    if (!profileName) return;
    const uiSettings = {
      referenceDate, timeWindowYears, activeSourceIds: Array.from(activeSourceIds),
      minEventYear, maxEventYear, isTimelineLockedToCenter
    };
    const profileData = DataManager.constructProfileData(profileName, uiSettings);
    const jsonString = JSON.stringify(profileData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${profileName.replace(/\s+/g, '_') || 'SAEH_Perfil'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleLoadProfileFile = async (profileFile) => {
    if (!profileFile) return;
    setIsLoading(true);
    try {
      const jsonString = await profileFile.text();
      const profileData = JSON.parse(jsonString);
      const processedProfile = await DataManager.loadDataFromProfile(profileData);
      if (processedProfile?.loaded_source_data_files?.length > 0) {
        alert(`Perfil "${processedProfile.profile_name}" carregado.\n\nPor favor, use agora a opção "Carregar Dados de Fonte (JSON)" para selecionar os seguintes arquivos de dados necessários:\n\n${processedProfile.loaded_source_data_files.join('\n')}\n\nOs dados atuais serão limpos primeiro.`);
      } else {
        DataManager.clearAllData();
        setAllLoadedEvents([]); setThemes([]); setAllSources([]);
        setAllCharacters([]); setAllPlaces([]); setActiveSourceIds(new Set());
        setMinEventYear(1400); setMaxEventYear(new Date().getFullYear());
      }
      if (processedProfile?.ui_settings) {
        const { referenceDate: refDate, timeWindowYears: twYears, minEventYear: profMin, maxEventYear: profMax, isTimelineLocked: profLocked } = processedProfile.ui_settings;
        if (refDate) setReferenceDate(refDate);
        if (twYears !== undefined) setTimeWindowYears(twYears);
        if (profMin !== undefined) setMinEventYear(profMin);
        if (profMax !== undefined) setMaxEventYear(profMax);
        if (profLocked !== undefined) setIsTimelineLockedToCenter(profLocked);
      }
    } catch (error) {
      alert(`Falha ao carregar ou analisar o arquivo de perfil. \nDetalhes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReferenceDateChangeAndUpdateTimeline = (newDate) => {
    setReferenceDate(newDate);
    if (isTimelineLockedToCenter && timelineViewRef.current) {
      timelineViewRef.current.centerOnDate(new Date(newDate));
    }
  };

  const handleOpenModal = (entityType, entityId) => {
    let data;
    switch (entityType) {
      case 'event': data = DataManager.getEventById(entityId); break;
      case 'character': data = DataManager.getCharacterById(entityId); break;
      case 'place': data = DataManager.getPlaceById(entityId); break;
      case 'theme': data = DataManager.getThemeById(entityId); break;
      case 'source': data = DataManager.getSourceInfoById(entityId); break;
      default: console.error("Unknown entity type for modal:", entityType); return;
    }
    if (data) {
      setSelectedEntityData(data); setSelectedEntityType(entityType); setIsModalOpen(true);
    } else {
      console.error(`No data found for ${entityType} with ID ${entityId}`);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false); setSelectedEntityData(null); setSelectedEntityType('');
  };

  const eventsInCurrentSourceFilters = useMemo(() => {
    return allLoadedEvents.filter(event => activeSourceIds.has(event.sourceId));
  }, [allLoadedEvents, activeSourceIds]);

  const charactersForList = useMemo(() => {
    return allCharacters.filter(c => activeSourceIds.has(c.sourceId));
  }, [allCharacters, activeSourceIds]);

  const placesForList = useMemo(() => {
    return allPlaces.filter(p => activeSourceIds.has(p.sourceId));
  }, [allPlaces, activeSourceIds]);

  return (
    <div id="app-container">
      {isLoading && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '20px', borderRadius: '8px', zIndex: 200 }}>
          Carregando dados...
        </div>
      )}
      <button 
        onClick={toggleControlsPanel}
        style={{
          position: 'absolute', top: '10px', left: '10px', zIndex: 110, 
          background: '#f8f9fa', border: '1px solid #ced4da', borderRadius: '50%',
          width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)', color: '#495057'
        }}
        title={isControlsPanelVisible ? "Fechar Painel de Controles" : "Abrir Painel de Controles"}
      >
        {isControlsPanelVisible ? '✕' : '☰'}
      </button>

      <DateControls
        referenceDate={referenceDate}
        onReferenceDateChange={handleReferenceDateChangeAndUpdateTimeline}
        timeWindowYears={timeWindowYears}
        onTimeWindowYearsChange={setTimeWindowYears}
        minEventYear={minEventYear}
        maxEventYear={maxEventYear}
      />

      {isControlsPanelVisible && (
        <div 
          id="controls-overlay-panel" 
          style={{ 
            position: 'absolute', top: '55px', left: '10px', 
            background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '8px', 
            zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            width: '320px', maxHeight: 'calc(100vh - 70px - 200px - 20px)', 
            overflowY: 'auto' 
          }}>
          <UIControls
            sources={allSources}
            activeSourceIds={activeSourceIds}
            onSourceFilterChange={handleSourceFilterChange}
            onLoadSourceDataFiles={handleLoadSourceDataFiles}
            onSaveProfile={handleSaveProfile}
            onLoadProfileFile={handleLoadProfileFile}
            isTimelineLocked={isTimelineLockedToCenter}
            onTimelineLockToggle={() => setIsTimelineLockedToCenter(!isTimelineLockedToCenter)}
          />
          <button 
            style={{ marginTop: '15px', padding: '8px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} 
            onClick={() => console.log("Events in current source filters:", eventsInCurrentSourceFilters)}
          >
            Log Eventos (Filtro Fonte)
          </button>
        </div>
      )}

      <div 
        id="right-side-panel"
        style={{
          position: 'absolute',
          top: '130px', 
          right: '10px',
          zIndex: 10, 
          width: '300px', 
          maxHeight: 'calc(100vh - 140px - 200px - 20px)', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px' 
        }}
      >
        <EntityListView
          characters={charactersForList}
          places={placesForList}
          themes={themes}
          sources={allSources}
          onEntityClick={handleOpenModal}
        />
        <TimelineLegend themes={themes} />
      </div>

      <div id="map-container">
        <MapView
          events={eventsInCurrentSourceFilters} 
          themes={themes}
          referenceDate={referenceDate}
          timeWindowYears={timeWindowYears}
          onEventClick={(eventId) => handleOpenModal('event', eventId)}
        />
      </div>

      <div id="timeline-overlay-container" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px', background: 'rgba(255,255,255,0.85)', zIndex: 5 , borderTop: '1px solid #ccc' }}>
        <TimelineView
          ref={timelineViewRef}
          events={eventsInCurrentSourceFilters} 
          themes={themes}
          referenceDate={referenceDate}
          onEventClick={(eventId) => handleOpenModal('event', eventId)}
          isTimelineLocked={isTimelineLockedToCenter} 
        />
      </div>

      <div
        id="modal-overlay-container"
        style={{
          display: isModalOpen ? 'flex' : 'none',
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', zIndex: 150,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isModalOpen && (
          <DetailModal
            entityData={selectedEntityData}
            entityType={selectedEntityType}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

export default App;
