let allSourcesInfo = [];
let allEvents = [];
let allCharacters = [];
let allPlaces = [];
let allThemes = [];
let loadedSourceFileNames = []; // Keep track of filenames for profile saving (original method)

/**
 * Clears all loaded data from the DataManager.
 */
function clearAllData() {
  allSourcesInfo = [];
  allEvents = [];
  allCharacters = [];
  allPlaces = [];
  allThemes = [];
  loadedSourceFileNames = [];
  console.log("DataManager: All data cleared.");
}

/**
 * Processes a single source-centric data file provided as a JSON string.
 * @param {string} jsonString - The JSON string content of the source data file.
 * @param {string} filename - The name of the loaded file (used for logging and tracking).
 * @returns {boolean} True if processing was successful, false otherwise.
 */
function loadSourceDataFromString(jsonString, filename) {
  try {
    const sourceData = JSON.parse(jsonString);

    if (!sourceData.source_info || !sourceData.source_info.id) {
      console.error(`File ${filename} is missing source_info or source_info.id. Skipping.`);
      alert(`Erro: Arquivo ${filename} não é um arquivo de dados de fonte SAEH válido (faltando source_info ou source_info.id).`);
      return false;
    }

    const sourceId = sourceData.source_info.id;

    // Check if source already loaded, if so, remove its old data first
    if (allSourcesInfo.some(s => s.id === sourceId)) {
      console.warn(`Source with ID ${sourceId} from file ${filename} already loaded. Replacing its data.`);
      allEvents = allEvents.filter(e => e.sourceId !== sourceId);
      allCharacters = allCharacters.filter(c => c.sourceId !== sourceId);
      allPlaces = allPlaces.filter(p => p.sourceId !== sourceId);
      // Themes are global, but if a source redefines a theme, we might update or ignore.
      // For simplicity, themes are additive and unique by their own ID.
      allSourcesInfo = allSourcesInfo.filter(s => s.id !== sourceId);
      loadedSourceFileNames = loadedSourceFileNames.filter(name => name !== filename); // Remove old filename if replacing
    }
    
    allSourcesInfo.push({ ...sourceData.source_info });

    (sourceData.events || []).forEach(event => {
      allEvents.push({ ...event, globalId: `${sourceId}_${event.id}`, sourceId: sourceId });
    });
    (sourceData.characters || []).forEach(character => {
      allCharacters.push({ ...character, globalId: `${sourceId}_${character.id}`, sourceId: sourceId });
    });
    (sourceData.places || []).forEach(place => {
      allPlaces.push({ ...place, globalId: `${sourceId}_${place.id}`, sourceId: sourceId });
    });
    (sourceData.themes || []).forEach(theme => {
      if (!allThemes.find(t => t.id === theme.id)) {
        allThemes.push({ ...theme }); // Themes are global by their own ID
      }
    });

    if (!loadedSourceFileNames.includes(filename)) {
        loadedSourceFileNames.push(filename);
    }
    console.log(`Successfully processed data from ${filename}`);
    return true;

  } catch (error) {
    console.error(`Error processing data from file ${filename}:`, error);
    alert(`Erro: Não foi possível analisar o JSON do arquivo ${filename}. Por favor, certifique-se de que é um JSON válido. \nDetalhes: ${error.message}`);
    return false;
  }
}

// --- Getter functions ---
const getSourcesInfo = () => [...allSourcesInfo];
const getAllEvents = () => [...allEvents];
const getAllCharacters = () => [...allCharacters];
const getAllPlaces = () => [...allPlaces];
const getAllThemes = () => [...allThemes];
const getEventById = (globalId) => allEvents.find(e => e.globalId === globalId);
const getCharacterById = (globalId) => allCharacters.find(c => c.globalId === globalId);
const getPlaceById = (globalId) => allPlaces.find(p => p.globalId === globalId);
const getThemeById = (themeId) => allThemes.find(t => t.id === themeId);
const getSourceInfoById = (sourceId) => allSourcesInfo.find(s => s.id === sourceId);

/**
 * Retrieves all loaded data, structured by source, suitable for embedding in a profile.
 * Each element in the returned array will represent a source file's content.
 * @returns {Array<Object>} An array of source data objects.
 */
function getFullLoadedDataForProfile() {
  const allData = [];
  for (const sourceInfo of allSourcesInfo) {
    const sourceId = sourceInfo.id;
    const sourceDataObject = {
      source_info: { ...sourceInfo },
      events: allEvents
        .filter(e => e.sourceId === sourceId)
        .map(e => {
          const { globalId, sourceId, ...localEvent } = e; // Destructure to remove runtime IDs
          return localEvent;
        }),
      characters: allCharacters
        .filter(c => c.sourceId === sourceId)
        .map(c => { 
          const { globalId, sourceId, ...localChar } = c;
          return localChar;
        }),
      places: allPlaces
        .filter(p => p.sourceId === sourceId)
        .map(p => {
          const { globalId, sourceId, ...localPlace } = p;
          return localPlace;
        }),
      themes: [] // Themes will be stored at the top level of the profile
    };
    allData.push(sourceDataObject);
  }
  return allData;
}

// --- Profile Management ---
/**
 * Constructs a profile data object.
 * @param {string} profileName - The name for the profile.
 * @param {Object} uiSettings - An object containing UI settings.
 * @returns {Object} The profile data object.
 */
function constructProfileData(profileName, uiSettings) {
  return {
    profile_name: profileName || "SAEH_Perfil",
    schema_version: "1.1.0", // Version indicating embedded data
    ui_settings: uiSettings,
    embedded_source_data: getFullLoadedDataForProfile(),
    themes_global: [...allThemes.map(t => ({...t}))] // Store a copy of all unique themes
  };
}

/**
 * Processes a loaded profile data object with embedded source data.
 * @param {Object} profileData - The parsed profile JSON object.
 * @returns {Promise<Object>} A promise that resolves with the processed profile data.
 */
async function loadDataFromProfile(profileData) {
  clearAllData(); 

  if (profileData.themes_global && Array.isArray(profileData.themes_global)) {
    allThemes = profileData.themes_global.map(t => ({...t}));
  }

  if (profileData.embedded_source_data && Array.isArray(profileData.embedded_source_data)) {
    profileData.embedded_source_data.forEach(sourceDataObject => {
      // We stringify and parse again to ensure it goes through the same loading logic
      // which handles ID generation and structuring.
      const success = loadSourceDataFromString(
        JSON.stringify(sourceDataObject), 
        sourceDataObject.source_info.name || 'embedded_source'
      );
      if (!success) {
        console.warn("Failed to load an embedded source from profile:", sourceDataObject.source_info.name);
      }
    });
  }
  return profileData; // Return profile data for UI settings application in App.jsx
}

export {
  clearAllData,
  loadSourceDataFromString,
  getSourcesInfo,
  getAllEvents,
  getAllCharacters,
  getAllPlaces,
  getAllThemes,
  getEventById,
  getCharacterById,
  getPlaceById,
  getThemeById,
  getSourceInfoById,
  // getLoadedSourceFileNames, // No longer used for primary profile data
  constructProfileData,
  loadDataFromProfile,
  getFullLoadedDataForProfile
};