import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapView from './components/MapView';
import TimelineView from './components/TimelineView';
import UIControls from './components/UIControls';
import DetailModal from './components/DetailModal';
import EntityListView from './components/EntityListView';
import LegendPanel from './components/LegendPanel';
import DateControls from './components/DateControls';
import DataManagementPage from './components/DataManagementPage';
import * as DataManager from './dataManager';
import { MAPBOX_ACCESS_TOKEN, DEFAULT_MAP_STYLE, AVAILABLE_MAP_STYLES, DATA_SOURCES } from './config';

const MainAppView = ({
  currentMapStyleUrl, minEventYear, maxEventYear, allLoadedEvents, themes, allSources,
  allCharacters, allPlaces, activeSourceIds, referenceDate, timeWindowYears,
  isModalOpen, selectedEntityData, selectedEntityType, isLoading, timelineViewRef,
  isTimelineLockedToCenter, isControlsPanelVisible, isTimelineExpanded,
  toggleControlsPanel, toggleTimelineExpanded, handleSourceFilterChange,
  handleLoadSourceDataFiles, handleSaveProfile, handleLoadProfileFile,
  handleMinEventYearChange, handleMaxEventYearChange, handleReferenceDateChangeAndUpdateTimeline,
  handleOpenModal, handleCloseModal, handleJumpToYear, handleSetTimelineZoomLevel,
  eventsInCurrentSourceFilters, charactersForList, placesForList, legendConfiguration,
  setCurrentMapStyleUrl, setIsTimelineLockedToCenter, setTimeWindowYears
}) => {
  return (
    <div id="app-container">
      {isLoading && (
        <div className="loading-indicator">
          Carregando dados...
        </div>
      )}
      {/* New wrapper for top-left controls */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={toggleControlsPanel}
          className="controls-toggle-button" // This class in App.css already handles some styling (like no bg/border)
          title={isControlsPanelVisible ? "Fechar Painel de Controles" : "Abrir Painel de Controles"}
          // style={{ color: 'var(--icon-button-color)', textShadow: 'var(--text-shadow-for-satellite)' }} // Redundant if App.css handles it
        >
          {isControlsPanelVisible ? '✕' : '☰'}
        </button>
        <Link
          to="/manage-data"
          style={{
            color: 'var(--management-link-color, var(--text-color))',
            background: 'var(--management-link-bg, var(--panel-bg-color))',
            padding: '6px 12px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.9em',
            boxShadow: 'var(--panel-shadow, 0 2px 4px rgba(0,0,0,0.1))',
            textShadow: 'var(--text-shadow-for-satellite, none)',
            display: 'inline-flex', // To align with button if needed
            alignItems: 'center'    // To align with button if needed
          }}
        >
          Gerenciar Dados
        </Link>
      </div>

      <div
        id="top-right-container"
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
          id="right-side-lists-container"
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
          id="controls-overlay-panel"
          style={{
            position: 'absolute', top: '55px', left: '10px',
            width: '320px', maxHeight: 'calc(100vh - 70px - 200px - 20px)',
            overflowY: 'auto',
            padding: '15px', borderRadius: '8px',
            zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
            availableMapStyles={AVAILABLE_MAP_STYLES}
            currentMapStyleUrl={currentMapStyleUrl}
            onMapStyleChange={setCurrentMapStyleUrl}
            // DATA_SOURCES related props removed
          />
          <button
            className="log-button-custom"
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
          mapStyleUrl={currentMapStyleUrl}
        />
      </div>

      <div
        id="timeline-overlay-container"
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
};

function App() {
  const [currentMapStyleUrl, setCurrentMapStyleUrl] = useState(DEFAULT_MAP_STYLE);
  const [minEventYear, setMinEventYear] = useState(2020);
  const [maxEventYear, setMaxEventYear] = useState(2025);
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
  const [isControlsPanelVisible, setIsControlsPanelVisible] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  // currentDataSourceId and setCurrentDataSourceId are removed

  const toggleControlsPanel = () => setIsControlsPanelVisible(!isControlsPanelVisible);

  const toggleTimelineExpanded = () => {
    setIsTimelineExpanded(prev => {
      const newExpandedState = !prev;
      if (newExpandedState) {
        setIsTimelineLockedToCenter(false); 
      }
      return newExpandedState;
    });
  };

  const calculateYearRange = (events) => {
    if (!events || events.length === 0) {
      return { min: 2020, max: 2025 }; 
    }
    const years = events.map(e => {
        const date = new Date(e.start_date);
        return isNaN(date.getFullYear()) ? null : date.getFullYear();
    }).filter(year => year !== null);
    if (years.length === 0) {
        return { min: 2020, max: 2025 };
    }
    const minYearFromEvents = Math.min(...years);
    const maxYearFromEvents = Math.max(...years);
    if (minYearFromEvents === maxYearFromEvents) {
      return { min: minYearFromEvents - 10, max: maxYearFromEvents + 10 };
    } else {
      return { min: minYearFromEvents, max: maxYearFromEvents };
    }
  };
 
  useEffect(() => {
    const selectedStyleConfig = AVAILABLE_MAP_STYLES.find(s => s.url === currentMapStyleUrl);
    if (selectedStyleConfig && selectedStyleConfig.uiTheme) {
      for (const [key, value] of Object.entries(selectedStyleConfig.uiTheme)) {
        document.documentElement.style.setProperty(key, value);
      }
    }
  }, [currentMapStyleUrl]);

  const currentUiTheme = useMemo(() => {
    const selectedStyleConfig = AVAILABLE_MAP_STYLES.find(s => s.url === currentMapStyleUrl);
    
    const themeFromSelection = selectedStyleConfig?.uiTheme;
    if (themeFromSelection) {
      return themeFromSelection;
    }
    
    const defaultStyleConfig = AVAILABLE_MAP_STYLES.find(s => s.url === DEFAULT_MAP_STYLE);
    const themeFromDefault = defaultStyleConfig?.uiTheme;

    if (themeFromDefault) {
      return themeFromDefault;
    }

    return {};
  }, [currentMapStyleUrl]);
 
  // useEffect to load the first predefined data source on initial mount, if available
  useEffect(() => {
    // No initial data source will be loaded by default.
    // Initialize states for an empty dataset.
    console.log("App: Initializing with no data sources loaded by default.");
    setIsLoading(true); // Briefly set loading true then false to ensure UI updates if needed
    refreshAllDataFromManager();
    setActiveSourceIds(new Set()); // Ensure no sources are active
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSourceFilterChange = (sourceId, isActive) => {
    setActiveSourceIds(prev => {
      const newActive = new Set(prev);
      if (isActive) newActive.add(sourceId); else newActive.delete(sourceId);
      return newActive;
    });
  };

  const refreshAllDataFromManager = () => {
    console.log("App: Refreshing all data from DataManager");
    const sources = DataManager.getSourcesInfo();
    const events = DataManager.getAllEvents();
    setAllLoadedEvents(events);
    setThemes(DataManager.getAllThemes());
    setAllSources(sources);
    setAllCharacters(DataManager.getAllCharacters());
    setAllPlaces(DataManager.getAllPlaces());
    // Recalculate year range based on potentially new events
    const { min, max } = calculateYearRange(events);
    setMinEventYear(min);
    setMaxEventYear(max);
    // Optionally, re-apply activeSourceIds if sources might have changed
    // For now, keep existing activeSourceIds unless a source was removed that was active
    setActiveSourceIds(prevActiveIds => {
        const currentSourceIds = new Set(sources.map(s => s.id));
        const newActiveIds = new Set();
        prevActiveIds.forEach(id => {
            if (currentSourceIds.has(id)) {
                newActiveIds.add(id);
            }
        });
        return newActiveIds.size > 0 ? newActiveIds : new Set(sources.map(s => s.id)); // Fallback to all if no active ones remain
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
    refreshAllDataFromManager(); // Refresh data after loading files
    setIsLoading(false);
  };
  
  const handleSaveProfile = () => {
    const profileName = prompt("Digite um nome para este perfil:", "SAEH_Perfil_Completo");
    if (!profileName) return;
    const uiSettings = {
      referenceDate, timeWindowYears, activeSourceIds: Array.from(activeSourceIds),
      minEventYear, maxEventYear, isTimelineLockedToCenter,
      currentMapStyleUrl 
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
      
      refreshAllDataFromManager(); // Refresh all data from DataManager after profile load

      if (processedProfile?.ui_settings) {
        const { 
          referenceDate: refDate, 
          timeWindowYears: twYears,
          minEventYear: profMin,
          maxEventYear: profMax,
          isTimelineLocked: profLocked,
          currentMapStyleUrl: loadedMapStyle,
          activeSourceIds: profActiveSourceIds
        } = processedProfile.ui_settings;
        if (refDate) setReferenceDate(refDate);
        if (twYears !== undefined) setTimeWindowYears(twYears);
        if (profLocked !== undefined) setIsTimelineLockedToCenter(profLocked);
        if (loadedMapStyle) setCurrentMapStyleUrl(loadedMapStyle); else setCurrentMapStyleUrl(DEFAULT_MAP_STYLE);
        
        // Use year range from profile if available, otherwise calculate
        const eventsForYearRange = DataManager.getAllEvents(); // Use freshly loaded events
        if (profMin !== undefined && profMax !== undefined) {
          setMinEventYear(profMin);
          setMaxEventYear(profMax);
        } else {
          const { min, max } = calculateYearRange(eventsForYearRange);
          setMinEventYear(min);
          setMaxEventYear(max);
        }
        if (profActiveSourceIds && Array.isArray(profActiveSourceIds)) {
            setActiveSourceIds(new Set(profActiveSourceIds));
        } else {
            // Fallback if not in profile, set all currently loaded sources as active
            setActiveSourceIds(new Set(DataManager.getSourcesInfo().map(s => s.id)));
        }

      } else { 
        setCurrentMapStyleUrl(DEFAULT_MAP_STYLE);
        const { min, max } = calculateYearRange(DataManager.getAllEvents()); 
        setMinEventYear(min);
        setMaxEventYear(max);
        setActiveSourceIds(new Set(DataManager.getSourcesInfo().map(s => s.id)));
      }
      alert(`Perfil "${processedProfile.profile_name || profileData.profile_name}" carregado.`);
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
        items: themeItems, 
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
        items: themeItems, 
        initiallyOpen: false
      }
    ];
  }, [themes]);

  const mainAppViewProps = {
    currentMapStyleUrl, minEventYear, maxEventYear, allLoadedEvents, themes, allSources,
    allCharacters, allPlaces, activeSourceIds, referenceDate, timeWindowYears,
    isModalOpen, selectedEntityData, selectedEntityType, isLoading, timelineViewRef,
    isTimelineLockedToCenter, isControlsPanelVisible, isTimelineExpanded,
    toggleControlsPanel, toggleTimelineExpanded, handleSourceFilterChange,
    handleLoadSourceDataFiles, handleSaveProfile, handleLoadProfileFile,
    handleMinEventYearChange, handleMaxEventYearChange, handleReferenceDateChangeAndUpdateTimeline,
    handleOpenModal, handleCloseModal, handleJumpToYear, handleSetTimelineZoomLevel,
    eventsInCurrentSourceFilters, charactersForList, placesForList, legendConfiguration,
    setCurrentMapStyleUrl,
    setIsTimelineLockedToCenter,
    setTimeWindowYears
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainAppView {...mainAppViewProps} />} />
        <Route path="/manage-data" element={
          <DataManagementPage 
            handleSaveProfile={handleSaveProfile}
            handleLoadProfileFile={handleLoadProfileFile} 
            onDataChange={refreshAllDataFromManager} // Pass the refresh handler
            allSources={allSources}
            allEvents={allLoadedEvents} // Corrected prop name
            allCharacters={allCharacters}
            allPlaces={allPlaces}
            allThemes={themes}
            currentUiTheme={currentUiTheme}
            currentMapStyleUrl={currentMapStyleUrl}
          />}
        />
      </Routes>
    </Router>
  );
}

export default App;
