// src/config.js

// IMPORTANT: Replace with your actual Mapbox Access Token
// For development purposes only. In a production environment,
// this token should be stored securely (e.g., environment variables).
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZWR1YXJkb21hdGhldXNmaWd1ZWlyYSIsImEiOiJjbTgwd2tqbzYwemRrMmpwdGVka2FrMG5nIn0.NfOWy2a0J-YHP4mdKs_TAQ';

const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
const INITIAL_MAP_CENTER = [-54.57, -25.53]; // Approx center of Brazil
const INITIAL_MAP_ZOOM = 3;

export {
  MAPBOX_ACCESS_TOKEN,
  DEFAULT_MAP_STYLE,
  INITIAL_MAP_CENTER,
  INITIAL_MAP_ZOOM,
};