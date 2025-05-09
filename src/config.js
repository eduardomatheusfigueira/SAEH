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
      '--button-primary-text': '#ffffff',
      '--date-control-label-color': '#333333', // Default to text-color
      '--entity-list-title-color': '#333333',  // Default to text-color
      '--text-shadow-for-satellite': 'none'
    }
  },
  {
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    uiTheme: {
      '--panel-background': 'rgba(255, 255, 255, 0.95)',
      '--text-color': '#333333',
      '--border-color': '#cccccc',
      '--button-primary-bg': '#007bff',
      '--button-primary-text': '#ffffff',
      '--date-control-label-color': '#333333',
      '--entity-list-title-color': '#333333',
      '--text-shadow-for-satellite': 'none'
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
      '--button-primary-text': '#ffffff',
      '--date-control-label-color': '#f0f0f0',
      '--entity-list-title-color': '#f0f0f0',
      '--text-shadow-for-satellite': 'none'
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
      '--button-primary-text': '#ffffff',
      '--date-control-label-color': '#ffffff', // White text for satellite
      '--entity-list-title-color': '#ffffff',  // White text for satellite
      '--text-shadow-for-satellite': '0 0 2px black, 0 0 1px black' // Added subtle shadow
    }
  }
];

const DATA_SOURCES = [
  {
    name: "A Viagem do Descobrimento (Bueno)",
    path: "/data/viagem_descobrimento_bueno_SAEH_data.json",
    id: "viagem_descobrimento_bueno"
  },
  {
    name: "História do Brasil (Boris Fausto)",
    path: "/data/boris_fausto_SAEH_data.json",
    id: "boris_fausto"
  },
  {
    name: "Exemplo de Fonte de Dados",
    path: "/data/example_source_data.json",
    id: "example_source"
  },
  {
    name: "História Concisa do Brasil (Boris Fausto)",
    path: "/data/fausto_boris_historia_concisa_SAEH_data.json",
    id: "fausto_boris_concisa"
  },
  {
    name: "A Invenção do Trabalhismo (Complementado)",
    path: "/data/invencao_trabalhismo_SAEH_data_complementado.json",
    id: "invencao_trabalhismo_comp"
  },
  {
    name: "A Invenção do Trabalhismo",
    path: "/data/invencao_trabalhismo_SAEH_data.json",
    id: "invencao_trabalhismo"
  }
];

export {
  MAPBOX_ACCESS_TOKEN,
  DEFAULT_MAP_STYLE,
  INITIAL_MAP_CENTER,
  INITIAL_MAP_ZOOM,
  AVAILABLE_MAP_STYLES,
  DATA_SOURCES,
};