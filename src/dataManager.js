// src/dataManager.js

let allSourcesInfo = []; // Stores source_info objects
let allEvents = [];
let allCharacters = [];
let allPlaces = [];
let allThemes = [];

let loadedSourceFileNames = []; // To keep track of filenames for profile saving

/**
 * Clears all loaded data from the DataManager.
 * Resets all internal arrays for sources, events, characters, places, themes, and loaded filenames.
 */
function clearAllData() {
  allSourcesInfo = [];
  allEvents = [];
  allCharacters = [];
  allPlaces = [];
  allThemes = [];
  loadedSourceFileNames = [];
  console.log("All data cleared from DataManager.");
}

/**
 * Processes a single source-centric data file provided as a JSON string.
 * Parses the JSON, extracts source information, events, characters, places, and themes.
 * Assigns global IDs to sub-entities (events, characters, places) by prefixing with the source ID.
 * Themes are treated as globally unique by their own ID.
 * Handles basic validation for the presence of `source_info` and `source_info.id`.
 * If a source with the same ID is reloaded, its previous data is cleared before adding the new data.
 *
 * @param {string} jsonString - The JSON string content of the source data file.
 * @param {string} filename - The name of the loaded file (used for logging and tracking).
 * @returns {boolean} True if processing was successful, false otherwise.
 */
function loadSourceDataFromString(jsonString, filename) {
  try {
    const sourceData = JSON.parse(jsonString);

    if (!sourceData.source_info || !sourceData.source_info.id) {
      console.error(`File ${filename} is missing source_info or source_info.id. Skipping.`);
      alert(`Error: File ${filename} is not a valid SAEH source data file (missing source_info or source_info.id).`);
      return false;
    }

    const sourceId = sourceData.source_info.id;

    // Check for duplicate source ID
    if (allSourcesInfo.some(s => s.id === sourceId)) {
      console.warn(`Source with ID ${sourceId} from file ${filename} already loaded. Consider implications for data merging or skipping.`);
      // For now, let's allow overwriting/merging if the same source file is loaded again,
      // but a more robust strategy might be needed (e.g., skip, or merge carefully).
      // We'll filter out old data from this source before adding new.
      allEvents = allEvents.filter(e => !(typeof e.globalId === 'string' && e.globalId.startsWith(`${sourceId}_`)));
      allCharacters = allCharacters.filter(c => !(typeof c.globalId === 'string' && c.globalId.startsWith(`${sourceId}_`)));
      allPlaces = allPlaces.filter(p => !(typeof p.globalId === 'string' && p.globalId.startsWith(`${sourceId}_`)));
      // For themes, we check global uniqueness by theme.id, so specific source filtering here is different.
      // If a source is reloaded, its themes are re-processed. If a theme.id is already global, it's not re-added.
      // If you need to remove themes *only* associated with this reloaded source (and not shared), logic would be more complex.
      // For now, the existing theme logic (add if not globally present) handles this reasonably for shared themes.
      allSourcesInfo = allSourcesInfo.filter(s => s.id !== sourceId);
    }

    allSourcesInfo.push(sourceData.source_info);

    // Process events
    (sourceData.events || []).forEach(event => {
      const globalEventId = `${sourceId}_${event.id}`;
      allEvents.push({ ...event, globalId: globalEventId, sourceId: sourceId });
    });

    // Process characters
    (sourceData.characters || []).forEach(character => {
      const globalCharId = `${sourceId}_${character.id}`;
      allCharacters.push({ ...character, globalId: globalCharId, sourceId: sourceId });
    });

    // Process places
    (sourceData.places || []).forEach(place => {
      const globalPlaceId = `${sourceId}_${place.id}`;
      allPlaces.push({ ...place, globalId: globalPlaceId, sourceId: sourceId });
    });

    // Process themes
    (sourceData.themes || []).forEach(theme => {
      const globalThemeId = `${sourceId}_${theme.id}`;
      // Check for duplicate theme IDs across all sources - themes can be shared
      const existingTheme = allThemes.find(t => t.id === theme.id); // Using original theme.id for global uniqueness
      if (!existingTheme) {
        allThemes.push({ ...theme, sourceId: sourceId }); // Store original theme, add sourceId for context
      } else {
        // Optionally merge or update theme info if needed, or just acknowledge it's shared
        // console.log(`Theme ${theme.id} from ${sourceId} already exists globally.`);
      }
    });

    if (!loadedSourceFileNames.includes(filename)) {
        loadedSourceFileNames.push(filename);
    }
    console.log(`Successfully processed data from ${filename}`);
    return true;

  } catch (error) {
    console.error(`Error processing data from file ${filename}:`, error);
    alert(`Error: Could not parse JSON from file ${filename}. Please ensure it is valid JSON. \nDetails: ${error.message}`);
    return false;
  }
}

// --- Getter functions ---

/**
 * Returns a copy of the array of all loaded source information objects.
 * @returns {Array<Object>} An array of source_info objects.
 */
const getSourcesInfo = () => [...allSourcesInfo];

/**
 * Returns a copy of the array of all loaded events, augmented with globalId and sourceId.
 * @returns {Array<Object>} An array of event objects.
 */
const getAllEvents = () => [...allEvents];

/**
 * Returns a copy of the array of all loaded characters, augmented with globalId and sourceId.
 * @returns {Array<Object>} An array of character objects.
 */
const getAllCharacters = () => [...allCharacters];
/**
 * Returns a copy of the array of all loaded places, augmented with globalId and sourceId.
 * @returns {Array<Object>} An array of place objects.
 */
const getAllPlaces = () => [...allPlaces];

/**
 * Returns a copy of the array of all loaded themes. Themes are globally unique by their own ID.
 * @returns {Array<Object>} An array of theme objects.
 */
const getAllThemes = () => [...allThemes];

/**
 * Retrieves a specific event by its globally unique ID.
 * @param {string} globalId - The global ID of the event (e.g., "sourceId_eventId").
 * @returns {Object|undefined} The event object if found, otherwise undefined.
 */
const getEventById = (globalId) => allEvents.find(e => e.globalId === globalId);

/**
 * Retrieves a specific character by its globally unique ID.
 * @param {string} globalId - The global ID of the character (e.g., "sourceId_characterId").
 * @returns {Object|undefined} The character object if found, otherwise undefined.
 */
const getCharacterById = (globalId) => allCharacters.find(c => c.globalId === globalId);

/**
 * Retrieves a specific place by its globally unique ID.
 * @param {string} globalId - The global ID of the place (e.g., "sourceId_placeId").
 * @returns {Object|undefined} The place object if found, otherwise undefined.
 */
const getPlaceById = (globalId) => allPlaces.find(p => p.globalId === globalId);

/**
 * Retrieves a specific theme by its ID.
 * @param {string} themeId - The ID of the theme.
 * @returns {Object|undefined} The theme object if found, otherwise undefined.
 */
const getThemeById = (themeId) => allThemes.find(t => t.id === themeId);

/**
 * Retrieves a specific source_info object by its ID.
 * @param {string} sourceId - The ID of the source.
 * @returns {Object|undefined} The source_info object if found, otherwise undefined.
 */
const getSourceInfoById = (sourceId) => allSourcesInfo.find(s => s.id === sourceId);

/**
 * Returns a copy of the array of filenames of all successfully loaded source data files.
 * @returns {Array<string>} An array of filenames.
 */
const getLoadedSourceFileNames = () => [...loadedSourceFileNames];

// --- Profile Management ---

/**
 * Constructs a profile data object.
 * @param {string} profileName - The name for the profile.
 * @param {Object} uiSettings - An object containing UI settings to be saved (e.g., referenceDate, active filters).
 * @returns {Object} The profile data object.
 */
function constructProfileData(profileName, uiSettings) {
  return {
    profile_name: profileName || "Untitled Profile",
    loaded_source_data_files: [...loadedSourceFileNames],
    ui_settings: uiSettings || {},
  };
}

/**
 * Processes a loaded profile data object.
 * Currently, this function clears all existing data in DataManager and returns the profile data.
 * The calling function (e.g., in App.jsx) is responsible for guiding the user
 * to re-select the source data files listed in `profileData.loaded_source_data_files`.
 *
 * @param {Object} profileData - The parsed profile JSON object.
 * @returns {Promise<Object>} A promise that resolves with the processed profile data.
 */
async function loadDataFromProfile(profileData) {
  console.warn("loadDataFromProfile: Clearing all current data. User will be prompted to re-select source files listed in the profile.");
  clearAllData(); // Clear existing data before processing profile file list
  // The actual re-loading of source files based on profileData.loaded_source_data_files
  // will be orchestrated by the UI (App.jsx) due to browser security restrictions on local file access.
  return profileData; // Return profile data for the UI to act upon.
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
  getLoadedSourceFileNames,
  constructProfileData,
  loadDataFromProfile,
};