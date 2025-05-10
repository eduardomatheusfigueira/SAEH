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

/**
 * Adds a new source to the in-memory store.
 * @param {object} sourceInfoData - An object containing the source_info.
 *                                  If id is not provided, a new one will be generated.
 * @returns {string|null} The ID of the added source, or null if failed.
 */
function addSource(sourceInfoData) {
  if (!sourceInfoData || typeof sourceInfoData !== 'object') {
    console.error("addSource: Invalid sourceInfoData provided.");
    return null;
  }

  let newSourceId = sourceInfoData.id;

  if (newSourceId) {
    if (allSourcesInfo.some(s => s.id === newSourceId)) {
      console.warn(`addSource: Source with ID ${newSourceId} already exists. Cannot add duplicate.`);
      // alert(`Já existe uma fonte com o ID: ${newSourceId}. Não é possível adicionar uma duplicata.`);
      return null; // Or perhaps return the existing sourceId if that's desired behavior
    }
  } else {
    // Generate a unique ID for the new in-memory source
    newSourceId = `inmemory_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`addSource: No ID provided, generated new ID: ${newSourceId}`);
  }

  const newSource = {
    id: newSourceId,
    name: sourceInfoData.name || `Nova Fonte (${newSourceId})`,
    author: sourceInfoData.author || "Desconhecido",
    color: sourceInfoData.color || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`, // Random color
    description_short: sourceInfoData.description_short || "Nova fonte de dados criada na sessão.",
    article_full: sourceInfoData.article_full || { current: "", previous: null },
    ...sourceInfoData // Spread any other properties from input
  };
  
  // Ensure the ID is correctly set from the potentially generated one
  newSource.id = newSourceId;


  allSourcesInfo.push(newSource);
  console.log(`addSource: Successfully added new source with ID: ${newSourceId}`);
  return newSourceId;
}

/**
 * Updates an existing source's information.
 * @param {string} sourceId - The ID of the source to update.
 * @param {object} newInfo - An object containing the properties to update.
 * @returns {boolean} True if successful, false otherwise.
 */
function updateSourceInfo(sourceId, newInfo) {
  if (!sourceId || !newInfo || typeof newInfo !== 'object') {
    console.error("updateSourceInfo: Invalid sourceId or newInfo provided.");
    return false;
  }

  const sourceIndex = allSourcesInfo.findIndex(s => s.id === sourceId);

  if (sourceIndex === -1) {
    console.warn(`updateSourceInfo: Source with ID ${sourceId} not found.`);
    return false;
  }

  // Update the source, ensuring the ID is not changed from newInfo
  allSourcesInfo[sourceIndex] = {
    ...allSourcesInfo[sourceIndex],
    ...newInfo,
    id: sourceId // Explicitly keep original ID
  };

  console.log(`updateSourceInfo: Successfully updated source with ID: ${sourceId}`);
  return true;
}

/**
 * Removes a source and all its associated entities from the in-memory store.
 * @param {string} sourceId - The ID of the source to remove.
 * @returns {boolean} True if successful, false otherwise.
 */
function removeSource(sourceId) {
  if (!sourceId) {
    console.error("removeSource: Invalid sourceId provided.");
    return false;
  }

  const initialSourceCount = allSourcesInfo.length;
  allSourcesInfo = allSourcesInfo.filter(s => s.id !== sourceId);

  if (allSourcesInfo.length === initialSourceCount) {
    console.warn(`removeSource: Source with ID ${sourceId} not found.`);
    return false;
  }

  allEvents = allEvents.filter(e => e.sourceId !== sourceId);
  allCharacters = allCharacters.filter(c => c.sourceId !== sourceId);
  allPlaces = allPlaces.filter(p => p.sourceId !== sourceId);

  // Remove from loadedSourceFileNames if the source was loaded from a file
  // This assumes a convention where the filename might be stored or inferred,
  // or that this array is managed elsewhere if sources are purely in-memory.
  // For now, we'll assume a direct match if a source had an associated filename.
  // This part might need refinement based on how `loadedSourceFileNames` is truly used.
  const sourceInfoToRemove = allSourcesInfo.find(s => s.id === sourceId); // Find it before filtering allSourcesInfo
  if (sourceInfoToRemove && sourceInfoToRemove.originalFilename) { // Assuming 'originalFilename' might be stored
    loadedSourceFileNames = loadedSourceFileNames.filter(name => name !== sourceInfoToRemove.originalFilename);
  } else {
    // If no direct filename link, this step might be skipped or handled differently.
    // For now, if a source is removed, we might not have a filename to remove from this specific array
    // if it was an in-memory source.
  }


  console.log(`removeSource: Successfully removed source with ID: ${sourceId} and its associated entities.`);
  return true;
}

/**
 * Adds a new event to a specified source.
 * @param {string} sourceId - The ID of the source to add the event to.
 * @param {object} eventData - The event data. If id is not provided, one will be generated.
 * @returns {string|null} The globalId of the added event, or null if failed.
 */
function addEventToSource(sourceId, eventData) {
  if (!sourceId || !eventData || typeof eventData !== 'object') {
    console.error("addEventToSource: Invalid sourceId or eventData provided.");
    return null;
  }

  if (!allSourcesInfo.some(s => s.id === sourceId)) {
    console.warn(`addEventToSource: Source with ID ${sourceId} not found. Cannot add event.`);
    return null;
  }

  let eventId = eventData.id;
  if (eventId) {
    const existingEvent = allEvents.find(e => e.sourceId === sourceId && e.id === eventId);
    if (existingEvent) {
      console.warn(`addEventToSource: Event with ID ${eventId} already exists in source ${sourceId}.`);
      return null;
    }
  } else {
    // Generate a unique ID for the new event within the source
    eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const globalId = `${sourceId}_${eventId}`;
  
  // Ensure default structure for article_full if not provided
  const articleFull = eventData.article_full && typeof eventData.article_full === 'object'
    ? { current: eventData.article_full.current || "", previous: eventData.article_full.previous || null }
    : { current: "", previous: null };

  const newEvent = {
    ...eventData, // Spread incoming data first
    id: eventId,   // Ensure our generated or validated ID is used
    globalId: globalId,
    sourceId: sourceId,
    article_full: articleFull, // Ensure article_full structure
    // Ensure other essential fields have defaults if not provided by eventData
    title: eventData.title || "Novo Evento",
    date_type: eventData.date_type || "single", // 'single' or 'period'
    start_date: eventData.start_date || new Date().toISOString().split('T')[0],
    end_date: eventData.date_type === "period" ? (eventData.end_date || eventData.start_date || new Date().toISOString().split('T')[0]) : null,
    characters_ids: eventData.characters_ids || [],
    place_id: eventData.place_id || null,
    longitude: eventData.longitude !== undefined ? eventData.longitude : null,
    latitude: eventData.latitude !== undefined ? eventData.latitude : null,
    main_theme_id: eventData.main_theme_id || null,
    secondary_tags_ids: eventData.secondary_tags_ids || [],
    description_short: eventData.description_short || ""
  };

  allEvents.push(newEvent);
  console.log(`addEventToSource: Successfully added event with globalId: ${globalId} to source ${sourceId}`);
  return globalId;
}

/**
 * Updates an existing event.
 * @param {string} globalEventId - The globalId of the event to update.
 * @param {object} updatedEventData - An object containing the event properties to update.
 * @returns {boolean} True if successful, false otherwise.
 */
function updateEventInSource(globalEventId, updatedEventData) {
  if (!globalEventId || !updatedEventData || typeof updatedEventData !== 'object') {
    console.error("updateEventInSource: Invalid globalEventId or updatedEventData provided.");
    return false;
  }

  const eventIndex = allEvents.findIndex(e => e.globalId === globalEventId);

  if (eventIndex === -1) {
    console.warn(`updateEventInSource: Event with globalId ${globalEventId} not found.`);
    return false;
  }

  const originalEvent = allEvents[eventIndex];

  // Preserve original IDs and sourceId
  const preservedIds = {
    id: originalEvent.id,
    sourceId: originalEvent.sourceId,
    globalId: originalEvent.globalId
  };

  // Handle potentially partial article_full update
  let newArticleFull = originalEvent.article_full;
  if (updatedEventData.article_full) {
    newArticleFull = {
      ...originalEvent.article_full,
      ...updatedEventData.article_full
    };
  }

  allEvents[eventIndex] = {
    ...originalEvent,
    ...updatedEventData,
    article_full: newArticleFull, // Apply merged article_full
    ...preservedIds // Ensure IDs are not overwritten
  };

  console.log(`updateEventInSource: Successfully updated event with globalId: ${globalEventId}`);
  return true;
}

/**
 * Deletes an event from the in-memory store.
 * @param {string} globalEventId - The globalId of the event to delete.
 * @returns {boolean} True if successful, false if event not found.
 */
function deleteEventFromSource(globalEventId) {
  if (!globalEventId) {
    console.error("deleteEventFromSource: Invalid globalEventId provided.");
    return false;
  }
  const initialLength = allEvents.length;
  allEvents = allEvents.filter(e => e.globalId !== globalEventId);

  if (allEvents.length < initialLength) {
    console.log(`deleteEventFromSource: Successfully deleted event with globalId: ${globalEventId}`);
    return true;
  } else {
    console.warn(`deleteEventFromSource: Event with globalId ${globalEventId} not found.`);
    return false;
  }
}

/**
 * Adds a new character to a specified source.
 * @param {string} sourceId - The ID of the source to add the character to.
 * @param {object} characterData - The character data. If id is not provided, one will be generated.
 * @returns {string|null} The globalId of the added character, or null if failed.
 */
function addCharacterToSource(sourceId, characterData) {
  if (!sourceId || !characterData || typeof characterData !== 'object') {
    console.error("addCharacterToSource: Invalid sourceId or characterData provided.");
    return null;
  }

  if (!allSourcesInfo.some(s => s.id === sourceId)) {
    console.warn(`addCharacterToSource: Source with ID ${sourceId} not found. Cannot add character.`);
    return null;
  }

  let characterId = characterData.id;
  if (characterId) {
    const existingCharacter = allCharacters.find(c => c.sourceId === sourceId && c.id === characterId);
    if (existingCharacter) {
      console.warn(`addCharacterToSource: Character with ID ${characterId} already exists in source ${sourceId}.`);
      return null;
    }
  } else {
    characterId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const globalId = `${sourceId}_${characterId}`;
  
  const articleFull = characterData.article_full && typeof characterData.article_full === 'object'
    ? { current: characterData.article_full.current || "", previous: characterData.article_full.previous || null }
    : { current: "", previous: null };

  const newCharacter = {
    ...characterData,
    id: characterId,
    globalId: globalId,
    sourceId: sourceId,
    name: characterData.name || "Novo Personagem",
    description_short: characterData.description_short || "",
    article_full: articleFull,
  };

  allCharacters.push(newCharacter);
  console.log(`addCharacterToSource: Successfully added character with globalId: ${globalId} to source ${sourceId}`);
  return globalId;
}

/**
 * Updates an existing character.
 * @param {string} globalCharacterId - The globalId of the character to update.
 * @param {object} updatedCharacterData - An object containing the character properties to update.
 * @returns {boolean} True if successful, false otherwise.
 */
function updateCharacterInSource(globalCharacterId, updatedCharacterData) {
  if (!globalCharacterId || !updatedCharacterData || typeof updatedCharacterData !== 'object') {
    console.error("updateCharacterInSource: Invalid globalCharacterId or updatedCharacterData provided.");
    return false;
  }

  const characterIndex = allCharacters.findIndex(c => c.globalId === globalCharacterId);

  if (characterIndex === -1) {
    console.warn(`updateCharacterInSource: Character with globalId ${globalCharacterId} not found.`);
    return false;
  }

  const originalCharacter = allCharacters[characterIndex];

  const preservedIds = {
    id: originalCharacter.id,
    sourceId: originalCharacter.sourceId,
    globalId: originalCharacter.globalId
  };

  let newArticleFull = originalCharacter.article_full;
  if (updatedCharacterData.article_full) {
    newArticleFull = {
      ...originalCharacter.article_full,
      ...updatedCharacterData.article_full
    };
  }

  allCharacters[characterIndex] = {
    ...originalCharacter,
    ...updatedCharacterData,
    article_full: newArticleFull,
    ...preservedIds
  };

  console.log(`updateCharacterInSource: Successfully updated character with globalId: ${globalCharacterId}`);
  return true;
}

/**
 * Deletes a character from the in-memory store and updates event references.
 * @param {string} globalCharacterId - The globalId of the character to delete.
 * @returns {boolean} True if successful, false if character not found.
 */
function deleteCharacterFromSource(globalCharacterId) {
  if (!globalCharacterId) {
    console.error("deleteCharacterFromSource: Invalid globalCharacterId provided.");
    return false;
  }
  const initialLength = allCharacters.length;
  allCharacters = allCharacters.filter(c => c.globalId !== globalCharacterId);

  if (allCharacters.length < initialLength) {
    // Remove the character's ID from any event that references it
    allEvents.forEach(event => {
      if (event.characters_ids && event.characters_ids.includes(globalCharacterId)) {
        event.characters_ids = event.characters_ids.filter(id => id !== globalCharacterId);
      }
    });
    console.log(`deleteCharacterFromSource: Successfully deleted character with globalId: ${globalCharacterId} and updated event references.`);
    return true;
  } else {
    console.warn(`deleteCharacterFromSource: Character with globalId ${globalCharacterId} not found.`);
    return false;
  }
}

/**
 * Adds a new place to a specified source.
 * @param {string} sourceId - The ID of the source to add the place to.
 * @param {object} placeData - The place data. If id is not provided, one will be generated.
 * @returns {string|null} The globalId of the added place, or null if failed.
 */
function addPlaceToSource(sourceId, placeData) {
  if (!sourceId || !placeData || typeof placeData !== 'object') {
    console.error("addPlaceToSource: Invalid sourceId or placeData provided.");
    return null;
  }

  if (!allSourcesInfo.some(s => s.id === sourceId)) {
    console.warn(`addPlaceToSource: Source with ID ${sourceId} not found. Cannot add place.`);
    return null;
  }

  let placeId = placeData.id;
  if (placeId) {
    const existingPlace = allPlaces.find(p => p.sourceId === sourceId && p.id === placeId);
    if (existingPlace) {
      console.warn(`addPlaceToSource: Place with ID ${placeId} already exists in source ${sourceId}.`);
      return null;
    }
  } else {
    placeId = `plc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const globalId = `${sourceId}_${placeId}`;

  const articleFull = placeData.article_full && typeof placeData.article_full === 'object'
    ? { current: placeData.article_full.current || "", previous: placeData.article_full.previous || null }
    : { current: "", previous: null };

  const newPlace = {
    ...placeData,
    id: placeId,
    globalId: globalId,
    sourceId: sourceId,
    name: placeData.name || "Novo Local",
    description_short: placeData.description_short || "",
    longitude: placeData.longitude !== undefined ? placeData.longitude : null,
    latitude: placeData.latitude !== undefined ? placeData.latitude : null,
    article_full: articleFull,
  };

  allPlaces.push(newPlace);
  console.log(`addPlaceToSource: Successfully added place with globalId: ${globalId} to source ${sourceId}`);
  return globalId;
}

/**
 * Updates an existing place.
 * @param {string} globalPlaceId - The globalId of the place to update.
 * @param {object} updatedPlaceData - An object containing the place properties to update.
 * @returns {boolean} True if successful, false otherwise.
 */
function updatePlaceInSource(globalPlaceId, updatedPlaceData) {
  if (!globalPlaceId || !updatedPlaceData || typeof updatedPlaceData !== 'object') {
    console.error("updatePlaceInSource: Invalid globalPlaceId or updatedPlaceData provided.");
    return false;
  }

  const placeIndex = allPlaces.findIndex(p => p.globalId === globalPlaceId);

  if (placeIndex === -1) {
    console.warn(`updatePlaceInSource: Place with globalId ${globalPlaceId} not found.`);
    return false;
  }

  const originalPlace = allPlaces[placeIndex];

  const preservedIds = {
    id: originalPlace.id,
    sourceId: originalPlace.sourceId,
    globalId: originalPlace.globalId
  };

  let newArticleFull = originalPlace.article_full;
  if (updatedPlaceData.article_full) {
    newArticleFull = {
      ...originalPlace.article_full,
      ...updatedPlaceData.article_full
    };
  }

  allPlaces[placeIndex] = {
    ...originalPlace,
    ...updatedPlaceData,
    article_full: newArticleFull,
    ...preservedIds
  };

  console.log(`updatePlaceInSource: Successfully updated place with globalId: ${globalPlaceId}`);
  return true;
}

/**
 * Deletes a place from the in-memory store and updates event references.
 * @param {string} globalPlaceId - The globalId of the place to delete.
 * @returns {boolean} True if successful, false if place not found.
 */
function deletePlaceFromSource(globalPlaceId) {
  if (!globalPlaceId) {
    console.error("deletePlaceFromSource: Invalid globalPlaceId provided.");
    return false;
  }

  const initialLength = allPlaces.length;
  const placeToRemove = allPlaces.find(p => p.globalId === globalPlaceId);

  if (!placeToRemove) {
    console.warn(`deletePlaceFromSource: Place with globalId ${globalPlaceId} not found.`);
    return false;
  }

  const { sourceId: placeSourceId, id: localPlaceId } = placeToRemove;

  allPlaces = allPlaces.filter(p => p.globalId !== globalPlaceId);

  if (allPlaces.length < initialLength) {
    // Nullify references in events from the same source
    allEvents.forEach(event => {
      if (event.sourceId === placeSourceId && event.place_id === localPlaceId) {
        event.place_id = null;
        // Potentially also nullify longitude/latitude if they were derived from this place
        // event.longitude = null;
        // event.latitude = null;
        // For now, only nullifying place_id to avoid unintended side effects on event coordinates
        // if they were manually set independently of the place.
      }
    });
    console.log(`deletePlaceFromSource: Successfully deleted place with globalId: ${globalPlaceId} and updated event references.`);
    return true;
  } else {
    // This case should ideally not be reached if placeToRemove was found
    console.warn(`deletePlaceFromSource: Place with globalId ${globalPlaceId} not found during filtering, though initially found.`);
    return false;
  }
}

/**
 * Adds a new theme to the global themes list.
 * @param {object} themeData - The theme data. If id is not provided, one will be generated.
 * @returns {string|null} The ID of the added theme, or null if failed.
 */
function addTheme(themeData) {
  if (!themeData || typeof themeData !== 'object') {
    console.error("addTheme: Invalid themeData provided.");
    return null;
  }

  let themeId = themeData.id;

  if (themeId) {
    if (allThemes.some(t => t.id === themeId)) {
      console.warn(`addTheme: Theme with ID ${themeId} already exists.`);
      return null;
    }
  } else {
    themeId = `thm_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const articleFull = themeData.article_full && typeof themeData.article_full === 'object'
    ? { current: themeData.article_full.current || "", previous: themeData.article_full.previous || null }
    : { current: "", previous: null };

  const newTheme = {
    ...themeData,
    id: themeId,
    name: themeData.name || "Novo Tema",
    color: themeData.color || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
    description_short: themeData.description_short || "",
    article_full: articleFull,
  };

  allThemes.push(newTheme);
  console.log(`addTheme: Successfully added theme with ID: ${themeId}`);
  return themeId;
}

/**
 * Updates an existing theme.
 * @param {string} themeId - The ID of the theme to update.
 * @param {object} updatedThemeData - An object containing the theme properties to update.
 * @returns {boolean} True if successful, false otherwise.
 */
function updateTheme(themeId, updatedThemeData) {
  if (!themeId || !updatedThemeData || typeof updatedThemeData !== 'object') {
    console.error("updateTheme: Invalid themeId or updatedThemeData provided.");
    return false;
  }

  const themeIndex = allThemes.findIndex(t => t.id === themeId);

  if (themeIndex === -1) {
    console.warn(`updateTheme: Theme with ID ${themeId} not found.`);
    return false;
  }

  const originalTheme = allThemes[themeIndex];

  let newArticleFull = originalTheme.article_full;
  if (updatedThemeData.article_full) {
    newArticleFull = {
      ...originalTheme.article_full,
      ...updatedThemeData.article_full
    };
  }

  allThemes[themeIndex] = {
    ...originalTheme,
    ...updatedThemeData,
    article_full: newArticleFull,
    id: themeId // Ensure ID is not overwritten
  };

  console.log(`updateTheme: Successfully updated theme with ID: ${themeId}`);
  return true;
}

/**
 * Deletes a theme from the global list and updates event references.
 * @param {string} themeId - The ID of the theme to delete.
 * @returns {boolean} True if successful, false if theme not found.
 */
function deleteTheme(themeId) {
  if (!themeId) {
    console.error("deleteTheme: Invalid themeId provided.");
    return false;
  }
  const initialLength = allThemes.length;
  allThemes = allThemes.filter(t => t.id !== themeId);

  if (allThemes.length < initialLength) {
    // Update references in events
    allEvents.forEach(event => {
      if (event.main_theme_id === themeId) {
        event.main_theme_id = null;
      }
      if (event.secondary_tags_ids && event.secondary_tags_ids.includes(themeId)) {
        event.secondary_tags_ids = event.secondary_tags_ids.filter(id => id !== themeId);
      }
    });
    console.log(`deleteTheme: Successfully deleted theme with ID: ${themeId} and updated event references.`);
    return true;
  } else {
    console.warn(`deleteTheme: Theme with ID ${themeId} not found.`);
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
  addSource,
  updateSourceInfo,
  removeSource,
  addEventToSource,
  updateEventInSource,
  deleteEventFromSource,
  addCharacterToSource,
  updateCharacterInSource,
  deleteCharacterFromSource,
  addPlaceToSource,
  updatePlaceInSource,
  deletePlaceFromSource,
  addTheme,
  updateTheme,
  deleteTheme, // Export new function
  constructProfileData,
  loadDataFromProfile,
  getFullLoadedDataForProfile
};