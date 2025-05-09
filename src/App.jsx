import React, { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import TimelineView from './components/TimelineView';
import UIControls from './components/UIControls';
import DetailModal from './components/DetailModal';
import EntityListView from './components/EntityListView';
import * as DataManager from './dataManager';
import { MAPBOX_ACCESS_TOKEN } from './config';

function App() {
  // Define minEventYear and maxEventYear at the top
  const [minEventYear, setMinEventYear] = useState(1400); // Default fallback
  const [maxEventYear, setMaxEventYear] = useState(new Date().getFullYear()); // Default fallback

  const [allLoadedEvents, setAllLoadedEvents] = useState([]);
  const [themes, setThemes] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [allCharacters, setAllCharacters] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [activeSourceIds, setActiveSourceIds] = useState(new Set());

  const [referenceDate, setReferenceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeWindowYears, setTimeWindowYears] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntityData, setSelectedEntityData] = useState(null);
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timelineViewRef = useRef(null);
  const [isTimelineLockedToCenter, setIsTimelineLockedToCenter] = useState(false);

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
          } else {
            setMinEventYear(1400);
            setMaxEventYear(new Date().getFullYear());
          }

          console.log(
            "Example data loaded. Events:", events.length,
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
    setIsLoading(true);
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
      setMinEventYear(1400);
      setMaxEventYear(new Date().getFullYear());
    }

    const currentActiveSources = DataManager.getSourcesInfo().map(s => s.id);
    setActiveSourceIds(new Set(currentActiveSources));
    setIsLoading(false);
  };

  const handleSaveProfile = () => {
    const profileName = prompt("Enter a name for this profile:", "SAEH_Profile");
    if (!profileName) return;

    const uiSettings = {
      referenceDate: referenceDate,
      timeWindowYears: timeWindowYears,
      activeSourceIds: Array.from(activeSourceIds),
      minEventYear: minEventYear,
      maxEventYear: maxEventYear,
    };

    const profileData = DataManager.constructProfileData(profileName, uiSettings);
    const jsonString = JSON.stringify(profileData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${profileName.replace(/\s+/g, '_') || 'SAEH_Profile'}.json`;
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
          setMinEventYear(1400);
          setMaxEventYear(new Date().getFullYear());
      }

      if (processedProfile && processedProfile.ui_settings) {
        const { referenceDate: refDate, timeWindowYears: twYears, activeSourceIds: storedActiveIds, minEventYear: profMinYear, maxEventYear: profMaxYear } = processedProfile.ui_settings;
        if (refDate) setReferenceDate(refDate);
        if (twYears !== undefined) setTimeWindowYears(twYears);
        // activeSourceIds will be set after user re-loads data files and handleLoadSourceDataFiles runs.
        if (profMinYear !== undefined) setMinEventYear(profMinYear);
        if (profMaxYear !== undefined) setMaxEventYear(profMaxYear);
        console.log("Profile UI settings suggest active sources (user will need to re-select data files and then filters if needed):", storedActiveIds);
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
  
  // This is the new combined handler for reference date changes
  const handleReferenceDateChangeAndUpdateTimeline = (newDate) => {
    setReferenceDate(newDate); // Update the referenceDate state
    if (isTimelineLockedToCenter && timelineViewRef.current) {
      // If locked, tell the timeline to re-center on this new date
      timelineViewRef.current.centerOnDate(new Date(newDate));
    }
  };

  const handleTimelinePeriodJump = (periodValue) => {
    if (!timelineViewRef.current) return;
    if (periodValue === "all") {
      timelineViewRef.current.resetZoom(); // This might need to also unlock and re-center if locked
    } else {
      const [startYear, endYear] = periodValue.split('-').map(Number);
      if (!isNaN(startYear) && !isNaN(endYear)) {
        const newStartDate = new Date(startYear, 0, 1);
        const newEndDate = new Date(endYear, 11, 31);
        timelineViewRef.current.jumpToPeriod(newStartDate, newEndDate);
        // If locked, also update reference date to middle of jumped period? Or just jump?
        // For now, just jump. User can then adjust ref date.
        // If locked, the jump itself will cause a re-center if ref date is also changed.
        // Let's simplify: jumpToPeriod will set the view. If locked, subsequent ref date changes will pan.
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
          onReferenceDateChange={handleReferenceDateChangeAndUpdateTimeline} // Use the new handler
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
          minEventYear={minEventYear}
          maxEventYear={maxEventYear}
          isTimelineLocked={isTimelineLockedToCenter}
          onTimelineLockToggle={() => setIsTimelineLockedToCenter(!isTimelineLockedToCenter)}
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
