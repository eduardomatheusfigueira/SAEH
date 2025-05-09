import React, { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView'; // Import MapView
import TimelineView from './components/TimelineView'; // Import TimelineView
import UIControls from './components/UIControls'; // Import UIControls
import DetailModal from './components/DetailModal'; // Import DetailModal
import EntityListView from './components/EntityListView'; // Import EntityListView
import * as DataManager from './dataManager'; // Import DataManager
import { MAPBOX_ACCESS_TOKEN } from './config'; // Import Mapbox token

function App() {
  const [allLoadedEvents, setAllLoadedEvents] = useState([]); // Store all events from DataManager
  const [themes, setThemes] = useState([]);
  const [allSources, setAllSources] = useState([]); // Store all source_info objects
  const [allCharacters, setAllCharacters] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [activeSourceIds, setActiveSourceIds] = useState(new Set()); // Store IDs of active sources

  const [referenceDate, setReferenceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Default to today in YYYY-MM-DD format
  });
  const [timeWindowYears, setTimeWindowYears] = useState(10); // Default time window in years
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedEntityData, setSelectedEntityData] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const timelineViewRef = useRef(null); // Ref for TimelineView component

  // Effect to load initial example data
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const response = await fetch('/data/example_source_data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        const success = DataManager.loadSourceDataFromString(JSON.stringify(jsonData), 'example_source_data.json');
        if (success) {
          const sources = DataManager.getSourcesInfo();
          setAllLoadedEvents(DataManager.getAllEvents());
          setThemes(DataManager.getAllThemes());
          setAllSources(sources);
          setAllCharacters(DataManager.getAllCharacters());
          setAllPlaces(DataManager.getAllPlaces());
          setActiveSourceIds(new Set(sources.map(s => s.id)));
          console.log(
            "Example data loaded. Events:", DataManager.getAllEvents().length,
            "Sources:", sources.length,
            "Characters:", DataManager.getAllCharacters().length,
            "Places:", DataManager.getAllPlaces().length
          );
        }
      } catch (error) {
        console.error("Could not load initial example data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSourceFilterChange = (sourceId, isActive) => {
    setActiveSourceIds(prevActiveSourceIds => {
      const newActiveSourceIds = new Set(prevActiveSourceIds);
      if (isActive) {
        newActiveSourceIds.add(sourceId);
      } else {
        newActiveSourceIds.delete(sourceId);
      }
      return newActiveSourceIds;
    });
  };

  const handleLoadSourceDataFiles = async (files) => {
    setIsLoading(true); // Set loading to true at the start
    // DataManager.clearAllData(); // REMOVE this line to make loading additive

    let allFilesProcessedSuccessfully = true;
    for (const file of files) {
      try {
        const jsonString = await file.text();
        const success = DataManager.loadSourceDataFromString(jsonString, file.name);
        if (!success) {
          allFilesProcessedSuccessfully = false;
          console.error(`Failed to process data from file: ${file.name}`);
        }
      } catch (error) {
        allFilesProcessedSuccessfully = false;
        console.error(`Error reading file ${file.name}:`, error);
        alert(`Error: Could not read file ${file.name}. \nDetails: ${error.message}`);
      }
    }

    if (allFilesProcessedSuccessfully) {
      console.log("All selected source data files processed.");
    } else {
      console.warn("Some source data files could not be processed completely.");
    }

    // Update App state with newly loaded data
    const sources = DataManager.getSourcesInfo();
    setAllLoadedEvents(DataManager.getAllEvents());
    setThemes(DataManager.getAllThemes());
    setAllSources(sources);
    setAllCharacters(DataManager.getAllCharacters());
    setAllPlaces(DataManager.getAllPlaces());
    // Set all newly loaded sources as active by default,
    // or merge with existing active IDs if you want to preserve selections across loads.
    // For now, let's re-activate all sources from the newly loaded set.
    const currentActiveSources = DataManager.getSourcesInfo().map(s => s.id);
    setActiveSourceIds(new Set(currentActiveSources));
    
    setIsLoading(false); // Set loading to false at the end
  };

  const handleSaveProfile = () => {
    const profileName = prompt("Enter a name for this profile:", "SAEH_Profile");
    if (!profileName) return; // User cancelled

    // Basic UI settings for now
    const uiSettings = {
      referenceDate: referenceDate,
      timeWindowYears: timeWindowYears,
      activeSourceIds: Array.from(activeSourceIds), // Convert Set to Array for JSON
      // Future: Add map_center, map_zoom from MapView if accessible
    };

    const profileData = DataManager.constructProfileData(profileName, uiSettings);
    const jsonString = JSON.stringify(profileData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${profileName.replace(/\s+/g, '_') || 'SAEH_Profile'}.json`; // Sanitize filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    console.log("Profile saved:", profileData);
  };

  const handleLoadProfileFile = async (profileFile) => {
    if (!profileFile) return;
    setIsLoading(true);
    try {
      const jsonString = await profileFile.text();
      const profileData = JSON.parse(jsonString);
      console.log("Profile data loaded:", profileData);

      const processedProfile = await DataManager.loadDataFromProfile(profileData);

      if (processedProfile && processedProfile.loaded_source_data_files && processedProfile.loaded_source_data_files.length > 0) {
        alert(`Profile "${processedProfile.profile_name}" loaded.\n\nPlease now use the "Load Source Data (JSON)" input to select the following required data files one by one (or all at once if your browser supports it for the same input):\n\n${processedProfile.loaded_source_data_files.join('\n')}\n\nData will be cleared first.`);
      } else {
         DataManager.clearAllData(); 
          setAllLoadedEvents([]);
          setThemes([]);
          setAllSources([]);
          setAllCharacters([]);
          setAllPlaces([]);
          setActiveSourceIds(new Set());
      }

      if (processedProfile && processedProfile.ui_settings) {
        const { referenceDate: refDate, timeWindowYears: twYears, activeSourceIds: activeIds } = processedProfile.ui_settings;
        if (refDate) setReferenceDate(refDate);
        if (twYears !== undefined) setTimeWindowYears(twYears);
        if (activeIds) {
            console.log("Profile UI settings suggest active sources (user will need to re-select data files and then filters if needed):", activeIds);
        }
      }
      console.log("Profile processed. Please re-select source data files as instructed.");

    } catch (error) {
      console.error("Error loading or parsing profile file:", error);
      alert(`Failed to load or parse the profile file. Please ensure it's a valid SAEH profile JSON. \nDetails: ${error.message}`);
    } finally {
      setIsLoading(false); 
    }
  };

  // Timeline control handlers
  const handleTimelineZoomIn = () => timelineViewRef.current?.zoomIn();
  const handleTimelineZoomOut = () => timelineViewRef.current?.zoomOut();
  const handleTimelinePanLeft = () => timelineViewRef.current?.panLeft();
  const handleTimelinePanRight = () => timelineViewRef.current?.panRight();
  const handleTimelineResetZoom = () => timelineViewRef.current?.resetZoom();
  const handleTimelinePeriodJump = (periodValue) => {
    if (!timelineViewRef.current) return;
    if (periodValue === "all") {
      timelineViewRef.current.resetZoom();
    } else {
      const [startYear, endYear] = periodValue.split('-').map(Number);
      if (!isNaN(startYear) && !isNaN(endYear)) {
        timelineViewRef.current.jumpToPeriod(new Date(startYear, 0, 1), new Date(endYear, 11, 31));
      }
    }
  };

  const handleOpenModal = (entityType, entityId) => {
    let data;
    switch (entityType) {
      case 'event':
        data = DataManager.getEventById(entityId);
        break;
      case 'character':
        data = DataManager.getCharacterById(entityId);
        break;
      case 'place':
        data = DataManager.getPlaceById(entityId);
        break;
      case 'theme':
        data = DataManager.getThemeById(entityId); 
        break;
      case 'source':
        data = DataManager.getSourceInfoById(entityId); 
        break;
      default:
        console.error("Unknown entity type for modal:", entityType);
        return;
    }
    if (data) {
      setSelectedEntityData(data);
      setSelectedEntityType(entityType);
      setIsModalOpen(true);
    } else {
      console.error(`No data found for ${entityType} with ID ${entityId}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntityData(null);
    setSelectedEntityType('');
  };

  const filteredEvents = allLoadedEvents.filter(event => activeSourceIds.has(event.sourceId));

  return (
    <div id="app-container">
      {isLoading && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '20px', borderRadius: '8px', zIndex: 100 }}>
          Loading data...
        </div>
      )}
      <div id="map-container">
        <MapView
          events={filteredEvents} 
          themes={themes}
          referenceDate={referenceDate}
          timeWindowYears={timeWindowYears}
          onEventClick={(eventId) => handleOpenModal('event', eventId)}
        />
      </div>

      <div id="timeline-overlay-container" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '200px', background: 'rgba(255,255,255,0.8)', zIndex: 10, borderTop: '1px solid #ccc' }}>
        <TimelineView
          ref={timelineViewRef} 
          events={filteredEvents} 
          themes={themes}
          referenceDate={referenceDate}
          onEventClick={(eventId) => handleOpenModal('event', eventId)}
        />
      </div>

      <div id="controls-overlay-panel" style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '5px', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <UIControls
          referenceDate={referenceDate}
          onReferenceDateChange={setReferenceDate}
          timeWindowYears={timeWindowYears}
          onTimeWindowYearsChange={setTimeWindowYears}
          sources={allSources}
          activeSourceIds={activeSourceIds}
          onSourceFilterChange={handleSourceFilterChange}
          onLoadSourceDataFiles={handleLoadSourceDataFiles}
          onSaveProfile={handleSaveProfile}
          onLoadProfileFile={handleLoadProfileFile}
          onTimelineZoomIn={handleTimelineZoomIn}
          onTimelineZoomOut={handleTimelineZoomOut}
          onTimelinePanLeft={handleTimelinePanLeft}
          onTimelinePanRight={handleTimelinePanRight}
          onTimelineResetZoom={handleTimelineResetZoom}
          onTimelinePeriodJump={handleTimelinePeriodJump}
        />
        <EntityListView
          characters={allCharacters.filter(c => activeSourceIds.has(c.sourceId))}
          places={allPlaces.filter(p => activeSourceIds.has(p.sourceId))}
          themes={themes} 
          sources={allSources} 
          onEntityClick={handleOpenModal}
        />
        <button style={{ marginTop: '10px' }} onClick={() => console.log("Filtered Events:", filteredEvents)}>Log Filtered Events</button>
      </div>

      <div
        id="modal-overlay-container"
        style={{
          display: isModalOpen ? 'flex' : 'none', 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 20,
          alignItems: 'center',
          justifyContent: 'center',
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
