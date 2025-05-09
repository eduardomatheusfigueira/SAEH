// src/config.js

// IMPORTANT: Replace with your actual Mapbox Access Token
// For development purposes only. In a production environment,
// this token should be stored securely (e.g., environment variables).
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZWR1YXJkb21hdGhldXNmaWd1ZWlyYSIsImEiOiJjbTgwd2tqbzYwemRrMmpwdGVka2FrMG5nIn0.NfOWy2a0J-YHP4mdKs_TAQ';

const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/dark-v11'; // Changed to Dark style
const INITIAL_MAP_CENTER = [-54.57, -25.53]; // Approx center of Brazil
const INITIAL_MAP_ZOOM = 3;

const AVAILABLE_MAP_STYLES = [
  {
    name: 'Light (Padrão)',
    url: 'mapbox://styles/mapbox/light-v11',
    uiTheme: {
      '--panel-background': 'rgba(255, 255, 255, 0.95)',
      '--text-color': '#333333',
      '--border-color': '#cccccc',
      '--button-primary-bg': '#007bff',
      '--button-primary-text': '#ffffff'
    }
  },
  {
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    uiTheme: { // Same as Light for now
      '--panel-background': 'rgba(255, 255, 255, 0.95)',
      '--text-color': '#333333',
      '--border-color': '#cccccc',
      '--button-primary-bg': '#007bff',
      '--button-primary-text': '#ffffff'
    }
  },
  {
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    uiTheme: {
      '--panel-background': '#2a2a2a',
      '--text-color': '#f0f0f0',
      '--border-color': '#444444',
      '--button-primary-bg': '#5865f2',
      '--button-primary-text': '#ffffff'
    }
  },
  {
    name: 'Satellite with Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    uiTheme: {
      '--panel-background': 'rgba(245, 245, 245, 0.92)',
      '--text-color': '#222222',
      '--border-color': '#dddddd',
      '--button-primary-bg': '#28a745',
      '--button-primary-text': '#ffffff'
    }
  }
];

export {
  MAPBOX_ACCESS_TOKEN,
  DEFAULT_MAP_STYLE,
  INITIAL_MAP_CENTER,
  INITIAL_MAP_ZOOM,
  AVAILABLE_MAP_STYLES,
};