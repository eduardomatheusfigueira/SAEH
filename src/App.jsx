import React, { useState, useEffect, useRef, useMemo } from 'react';
import MapView from './components/MapView';
import TimelineView from './components/TimelineView';
import UIControls from './components/UIControls';
import DetailModal from './components/DetailModal';
import EntityListView from './components/EntityListView';
// import TimelineLegend from './components/TimelineLegend'; // To be replaced
import LegendPanel from './components/LegendPanel'; // Import new component
import DateControls from './components/DateControls';
import * as DataManager from './dataManager';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_STYLE, AVAILABLE_MAP_STYLES } from './config'; // Added imports

function App() {
  const [currentMapStyleUrl, setCurrentMapStyleUrl] = useState(DEFAULT_MAP_STYLE); // New state
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
  const [isControlsPanelVisible, setIsControlsPanelVisible] = useState(false); // Changed default to false
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);

  const toggleControlsPanel = () => setIsControlsPanelVisible(!isControlsPanelVisible);

  const toggleTimelineExpanded = () => {
    setIsTimelineExpanded(prev => {
      const newExpandedState = !prev;
      if (newExpandedState) {
        setIsTimelineLockedToCenter(false); // Unlock timeline when expanding
      }
      return newExpandedState;
    });
  };

  useEffect(() => { // Effect to apply UI theme
    const selectedStyleConfig = AVAILABLE_MAP_STYLES.find(s => s.url === currentMapStyleUrl);
    if (selectedStyleConfig && selectedStyleConfig.uiTheme) {
      for (const [key, value] of Object.entries(selectedStyleConfig.uiTheme)) {
        document.documentElement.style.setProperty(key, value);
      }
    }
  }, [currentMapStyleUrl]);

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
        }
      } catch (error) { console.error("Could not load initial example data:", error); }
      finally { setIsLoading(false); }
    }
    // loadInitialData();
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
    setAllLoadedEvents(DataManager.getAllEvents());
    setThemes(DataManager.getAllThemes());
    setAllSources(sources);
    setAllCharacters(DataManager.getAllCharacters());
    setAllPlaces(DataManager.getAllPlaces());
    setActiveSourceIds(new Set(sources.map(s => s.id)));
    setIsLoading(false);
  };

  const handleSaveProfile = () => {
    const profileName = prompt("Digite um nome para este perfil:", "SAEH_Perfil_Completo");
    if (!profileName) return;
    const uiSettings = {
      referenceDate, timeWindowYears, activeSourceIds: Array.from(activeSourceIds),
      minEventYear, maxEventYear, isTimelineLockedToCenter,
      currentMapStyleUrl // Added to profile
    };
    const profileData = DataManager.constructProfileData(profileName, uiSettings);
    const jsonString = JSON.stringify(profileData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${profileName.replace(/\s+/g, '_') || 'SAEH_Perfil_Completo'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    console.log("Profile with embedded data saved.");
  };

  const handleLoadProfileFile = async (profileFile) => {
    if (!profileFile) return;
    setIsLoading(true);
    try {
      const jsonString = await profileFile.text();
      const profileData = JSON.parse(jsonString);
      const processedProfile = await DataManager.loadDataFromProfile(profileData); 
      const sources = DataManager.getSourcesInfo();
      const events = DataManager.getAllEvents();
      setAllLoadedEvents(events);
      setThemes(DataManager.getAllThemes()); 
      setAllSources(sources);
      setAllCharacters(DataManager.getAllCharacters());
      setAllPlaces(DataManager.getAllPlaces());
      
      if (processedProfile?.ui_settings?.activeSourceIds && Array.isArray(processedProfile.ui_settings.activeSourceIds)) {
        setActiveSourceIds(new Set(processedProfile.ui_settings.activeSourceIds));
      } else {
        setActiveSourceIds(new Set(sources.map(s => s.id))); 
      }
      
      if (processedProfile?.ui_settings) {
        const { 
          referenceDate: refDate, 
          timeWindowYears: twYears,
          minEventYear: profMin,
          maxEventYear: profMax,
          isTimelineLocked: profLocked,
          currentMapStyleUrl: loadedMapStyle // Added to destructuring
        } = processedProfile.ui_settings;
        if (refDate) setReferenceDate(refDate);
        if (twYears !== undefined) setTimeWindowYears(twYears);
        if (profMin !== undefined) setMinEventYear(profMin);
        if (profMax !== undefined) setMaxEventYear(profMax);
        if (profLocked !== undefined) setIsTimelineLockedToCenter(profLocked);
        if (loadedMapStyle) setCurrentMapStyleUrl(loadedMapStyle); else setCurrentMapStyleUrl(DEFAULT_MAP_STYLE);
      } else {
        setCurrentMapStyleUrl(DEFAULT_MAP_STYLE); // Default if not in profile
        if (events.length > 0) {
            const years = events.map(e => new Date(e.start_date).getFullYear());
            setMinEventYear(Math.min(...years));
            setMaxEventYear(Math.max(...years));
        } else {
            setMinEventYear(1400); 
            setMaxEventYear(new Date().getFullYear());
        }
      }
      alert(`Perfil "${processedProfile.profile_name || profileData.profile_name}" carregado com dados embutidos.`);
    } catch (error) {
      console.error("Error loading or parsing profile file:", error);
      alert(`Falha ao carregar ou analisar o arquivo de perfil. \nDetalhes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMinEventYearChange = (year) => {
    const newMinYear = parseInt(year, 10);
    if (!isNaN(newMinYear) && newMinYear <= maxEventYear) {
      setMinEventYear(newMinYear);
      const currentRefYear = new Date(referenceDate).getFullYear();
      if (currentRefYear < newMinYear) {
        handleReferenceDateChangeAndUpdateTimeline(`${newMinYear}-${referenceDate.substring(5)}`);
      }
    }
  };

  const handleMaxEventYearChange = (year) => {
    const newMaxYear = parseInt(year, 10);
    if (!isNaN(newMaxYear) && newMaxYear >= minEventYear) {
      setMaxEventYear(newMaxYear);
      const currentRefYear = new Date(referenceDate).getFullYear();
      if (currentRefYear > newMaxYear) {
        handleReferenceDateChangeAndUpdateTimeline(`${newMaxYear}-${referenceDate.substring(5)}`);
      }
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

  const handleJumpToYear = (year) => {
    if (timelineViewRef.current && year) {
      timelineViewRef.current.jumpToYear(year);
    }
  };

  const handleSetTimelineZoomLevel = (level) => {
    if (timelineViewRef.current && level) {
      timelineViewRef.current.setZoomLevel(level);
    }
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

  const legendConfiguration = useMemo(() => {
    const themeItems = themes.map(theme => ({
      color: theme.color || '#808080',
      label: theme.name,
      description: theme.description_short
    }));
    // themeItems.push({ color: '#808080', label: 'Padrão (Tema não definido)' }); // Removed as per feedback

    return [
      {
        id: 'mapFill',
        title: 'Mapa: Cor de Preenchimento do Ponto',
        items: themeItems,
        initiallyOpen: true
      },
      {
        id: 'mapBorder',
        title: 'Mapa: Cor da Borda do Ponto',
        items: [
          { color: '#FF0000', label: 'Evento Anterior à Data de Referência' },
          { color: '#0000FF', label: 'Evento Posterior à Data de Referência' },
          { color: '#FFFFFF', label: 'Evento na Data de Referência', swatchStyle: { backgroundColor: '#FFFFFF', border: '1px solid #ccc' } }
        ],
        initiallyOpen: true
      },
      {
        id: 'timelinePointBorder',
        title: 'Linha do Tempo: Cor da Borda do Ponto (Evento Único)',
        items: themeItems, // Uses the same theme logic
        initiallyOpen: false
      },
      {
        id: 'timelinePointFill',
        title: 'Linha do Tempo: Cor de Preenchimento do Ponto (Evento Único)',
        items: [
          { color: 'white', label: 'Preenchimento Padrão', swatchStyle: { backgroundColor: 'white', border: '1px solid #ccc' } }
        ],
        initiallyOpen: false
      },
      {
        id: 'timelineBarFill',
        title: 'Linha do Tempo: Cor da Barra (Período)',
        items: themeItems, // Uses the same theme logic
        initiallyOpen: false
      }
    ];
  }, [themes]);

  return (
    <div id="app-container">
      {isLoading && (
        <div className="loading-indicator"> {/* Changed to class */}
          Carregando dados...
        </div>
      )}
      <button
        onClick={toggleControlsPanel}
        className="controls-toggle-button" // Changed to class
        title={isControlsPanelVisible ? "Fechar Painel de Controles" : "Abrir Painel de Controles"}
      >
        {isControlsPanelVisible ? '✕' : '☰'}
      </button>

      <div
        id="top-right-container" // Inline styles remain for positioning, gap already adjusted
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 105,
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
          maxWidth: '320px',
        }}
      >
        <DateControls
          referenceDate={referenceDate}
          onReferenceDateChange={handleReferenceDateChangeAndUpdateTimeline}
          timeWindowYears={timeWindowYears}
          onTimeWindowYearsChange={setTimeWindowYears}
          minEventYear={minEventYear}
          maxEventYear={maxEventYear}
          onMinEventYearChange={handleMinEventYearChange}
          onMaxEventYearChange={handleMaxEventYearChange}
        />
        <div
          id="right-side-lists-container" // Inline styles remain for positioning, gap already adjusted
          style={{
            width: '100%',
            maxHeight: 'calc(100vh - 150px - 200px - 30px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px'
          }}
        >
          <EntityListView
            characters={charactersForList}
            places={placesForList}
            themes={themes}
            sources={allSources}
            onEntityClick={handleOpenModal}
          />
          <LegendPanel legendSections={legendConfiguration} />
        </div>
      </div>

      {isControlsPanelVisible && (
        <div
          id="controls-overlay-panel" // Will be styled by App.css using variables
          // Removed inline styles for background, padding, borderRadius, zIndex, boxShadow
          // Kept positioning and sizing inline styles as they are layout specific
          style={{
            position: 'absolute', top: '55px', left: '10px',
            width: '320px', maxHeight: 'calc(100vh - 70px - 200px - 20px)',
            overflowY: 'auto',
            padding: '15px', borderRadius: '8px', // Kept these as they are specific to this panel
            zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' // Kept these
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
            isTimelineExpanded={isTimelineExpanded}
            onToggleTimelineExpanded={toggleTimelineExpanded}
            onJumpToYear={handleJumpToYear}
            onSetTimelineZoomLevel={handleSetTimelineZoomLevel}
            availableMapStyles={AVAILABLE_MAP_STYLES} // Pass new prop
            currentMapStyleUrl={currentMapStyleUrl} // Pass new prop
            onMapStyleChange={setCurrentMapStyleUrl} // Pass new prop
          />
          <button
            className="log-button-custom" // Changed to class
            onClick={() => console.log("Events in current source filters:", eventsInCurrentSourceFilters)}
          >
            Log Eventos (Filtro Fonte)
          </button>
        </div>
      )}

      <div id="map-container" style={{ height: isTimelineExpanded ? '30vh' : 'calc(100vh - 200px)' }}>
        <MapView
          events={eventsInCurrentSourceFilters}
          themes={themes}
          referenceDate={referenceDate}
          timeWindowYears={timeWindowYears}
          onEventClick={(eventId) => handleOpenModal('event', eventId)}
          mapStyleUrl={currentMapStyleUrl} // Pass new prop
        />
      </div>

      <div
        id="timeline-overlay-container" // Will be styled by App.css using variables
        // Removed inline styles for background, borderTop
        // Kept positioning and sizing inline styles
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: isTimelineExpanded ? '70vh' : '200px',
          zIndex: 5 ,
          transition: 'height 0.3s ease-in-out'
        }}
      >
        <TimelineView
          ref={timelineViewRef}
          events={eventsInCurrentSourceFilters}
          themes={themes}
          referenceDate={referenceDate}
          onEventClick={(eventId) => handleOpenModal('event', eventId)}
          isTimelineLocked={isTimelineLockedToCenter}
          isTimelineExpanded={isTimelineExpanded}
        />
      </div>

      <div // This is the modal backdrop, not the content panel itself
        id="modal-overlay-container"
        style={{
          display: isModalOpen ? 'flex' : 'none',
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', zIndex: 150,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isModalOpen && (
          <DetailModal // DetailModal itself will get a class for theming its content box
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
