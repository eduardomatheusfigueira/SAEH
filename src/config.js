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
      '--main-bg-color': '#f0f2f5',
      '--panel-background': 'rgba(255, 255, 255, 0.95)',
      '--text-color': '#333333',
      '--text-color-muted': '#6c757d',
      '--border-color': '#cccccc',
      '--input-bg-color': '#ffffff',
      '--button-primary-bg': '#007bff',
      '--button-primary-text': '#ffffff',
      '--button-secondary-bg': '#6c757d',
      '--button-secondary-text': '#ffffff',
      '--danger-color': '#dc3545',
      '--highlight-bg-color': '#007bff',
      '--highlight-bg-color-subtle': '#e9ecef',
      '--link-color': '#007bff',
      '--icon-button-color': '#333333',
      '--management-link-color': '#007bff',
      '--management-link-bg': 'rgba(255, 255, 255, 0.85)',
      '--panel-shadow': '0 4px 12px rgba(0,0,0,0.1)',
      '--date-control-label-color': '#333333',
      '--entity-list-title-color': '#333333',
      '--text-shadow-for-satellite': 'none'
    }
  },
  {
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    uiTheme: { // Similar to Light for now, can be customized
      '--main-bg-color': '#f0f2f5',
      '--panel-background': 'rgba(255, 255, 255, 0.95)',
      '--text-color': '#333333',
      '--text-color-muted': '#6c757d',
      '--border-color': '#cccccc',
      '--input-bg-color': '#ffffff',
      '--button-primary-bg': '#007bff',
      '--button-primary-text': '#ffffff',
      '--button-secondary-bg': '#6c757d',
      '--button-secondary-text': '#ffffff',
      '--danger-color': '#dc3545',
      '--highlight-bg-color': '#007bff',
      '--highlight-bg-color-subtle': '#e9ecef',
      '--link-color': '#007bff',
      '--icon-button-color': '#333333',
      '--management-link-color': '#007bff',
      '--management-link-bg': 'rgba(255, 255, 255, 0.85)',
      '--panel-shadow': '0 4px 12px rgba(0,0,0,0.1)',
      '--date-control-label-color': '#333333',
      '--entity-list-title-color': '#333333',
      '--text-shadow-for-satellite': 'none'
    }
  },
  {
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    uiTheme: {
      '--main-bg-color': '#121212', // Very dark gray for page background
      '--panel-background': '#1E1E1E', // Dark gray for panels, slightly lighter than main
      '--text-color': '#EAEAEA', // Bright light gray for high contrast text
      '--text-color-muted': '#B0B0B0', // Muted light gray for secondary text
      '--border-color': '#383838', // Subtle dark border
      '--input-bg-color': '#2C2C2C', // Dark gray for input backgrounds
      '--button-primary-bg': '#5865f2', // Keep existing primary button
      '--button-primary-text': '#ffffff',
      '--button-secondary-bg': '#4f545c',
      '--button-secondary-text': '#ffffff',
      '--danger-color': '#ed4245',
      '--highlight-bg-color': '#5865f2', // Active selection matches primary button
      '--highlight-bg-color-subtle': '#303030', // Darker subtle highlight
      '--link-color': '#79addc', // Adjusted link color for dark theme
      '--icon-button-color': '#EAEAEA',
      '--management-link-color': '#79addc',
      '--management-link-bg': 'rgba(30, 30, 30, 0.85)', // Matches new panel bg
      '--panel-shadow': '0 4px 12px rgba(0,0,0,0.5)', // Slightly stronger shadow for dark theme
      '--date-control-label-color': '#EAEAEA',
      '--entity-list-title-color': '#EAEAEA',
      '--text-shadow-for-satellite': 'none' // No text shadow needed for regular dark theme
    }
  },
  {
    name: 'Satellite with Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    uiTheme: {
      '--main-bg-color': '#101010', // Darker background for satellite contrast
      '--panel-background': 'rgba(30, 30, 30, 0.85)', // Darker, semi-transparent panels
      '--text-color': '#f0f0f0', // Light text for dark panels
      '--text-color-muted': '#adb5bd',
      '--border-color': '#555555',
      '--input-bg-color': 'rgba(50, 50, 50, 0.9)',
      '--button-primary-bg': '#28a745', // Keep green for primary actions
      '--button-primary-text': '#ffffff',
      '--button-secondary-bg': '#5a6268',
      '--button-secondary-text': '#ffffff',
      '--danger-color': '#ef5350',
      '--highlight-bg-color': '#28a745',
      '--highlight-bg-color-subtle': 'rgba(40, 167, 69, 0.2)',
      '--link-color': '#66bb6a', // Lighter green for links
      '--icon-button-color': '#FFFFFF', // As requested
      '--management-link-color': '#FFFFFF', // As requested
      '--management-link-bg': 'rgba(0,0,0,0.4)', // Darker semi-transparent for "Gerenciar Dados"
      '--panel-shadow': '0 4px 12px rgba(0,0,0,0.4)',
      '--date-control-label-color': '#ffffff',
      '--entity-list-title-color': '#ffffff',
      '--text-shadow-for-satellite': '0 0 3px black, 0 0 2px black' // Enhanced shadow
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