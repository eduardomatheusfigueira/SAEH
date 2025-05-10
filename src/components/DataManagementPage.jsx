import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import * as DataManager from '../dataManager'; // Assuming dataManager.js is in src
// We'll need to pass down functions from App.jsx for loading/saving profiles
// and potentially for accessing the main app's data state if not using DataManager directly for everything.

const DataManagementPage = ({
  // Props to be passed from App.jsx:
  // handleSaveProfile, (will be passed from App)
  // handleLoadProfile, (will be passed from App)
  // allSources, (from App state, derived from DataManager)
  // allEvents, (from App state)
  // allCharacters, (from App state)
  // allPlaces, (from App state)
  // allThemes, (from App state)
  // functions to trigger App.jsx to re-fetch from DataManager if needed
}) => {
  const [activeTab, setActiveTab] = useState('sources'); // e.g., 'sources', 'events', etc.
  const [selectedSourceId, setSelectedSourceId] = useState(null); // To filter entities by source
  const [selectedItem, setSelectedItem] = useState(null); // For the detail/edit pane
  const [itemList, setItemList] = useState([]); // Data for the list pane

  // Placeholder: Fetch initial data for lists (e.g., sources)
  // This will be refined to use props or DataManager directly
  useEffect(() => {
    if (activeTab === 'sources') {
      // setItemList(DataManager.getSourcesInfo()); // Example
    }
    // Add more conditions for other tabs
  }, [activeTab]);

  const renderListPane = () => {
    // Based on activeTab and selectedSourceId, render the list of items
    // For now, a placeholder
    return (
      <div className="list-pane" style={{ border: '1px solid #ccc', padding: '10px', minHeight: '300px', overflowY: 'auto', flex: 1 }}>
        <h4>List of {activeTab}</h4>
        {/* Placeholder for item list */}
        {itemList.map(item => (
          <div key={item.id || item.globalId} onClick={() => setSelectedItem(item)} style={{cursor: 'pointer', padding: '5px', borderBottom: '1px solid #eee'}}>
            {item.name || item.title || item.id}
          </div>
        ))}
        {itemList.length === 0 && <p>No items to display for {activeTab}.</p>}
      </div>
    );
  };

  const renderDetailEditPane = () => {
    // Based on selectedItem, render its details or an edit form
    // For now, a placeholder
    if (!selectedItem) {
      return <div className="detail-pane" style={{ border: '1px solid #ccc', padding: '10px', flex: 2 }}>Select an item to see details.</div>;
    }
    return (
      <div className="detail-pane" style={{ border: '1px solid #ccc', padding: '10px', flex: 2 }}>
        <h4>Details / Edit Form for {selectedItem.name || selectedItem.title || selectedItem.id}</h4>
        <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
        {/* Placeholder for form fields */}
      </div>
    );
  };

  return (
    <div className="data-management-page" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 40px)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--link-color, blue)', marginRight: '20px' }}>&larr; Back to Main View</Link>
        <h2>Data Management</h2>
        <div>
          <button onClick={() => alert("Load Profile clicked")} style={{ marginRight: '10px' }}>Load Profile</button>
          <button onClick={() => alert("Save All to Profile clicked")}>Save All to Profile</button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('sources')} disabled={activeTab === 'sources'}>Sources</button>
        <button onClick={() => setActiveTab('events')} disabled={activeTab === 'events'}>Events</button>
        <button onClick={() => setActiveTab('characters')} disabled={activeTab === 'characters'}>Characters</button>
        <button onClick={() => setActiveTab('places')} disabled={activeTab === 'places'}>Places</button>
        <button onClick={() => setActiveTab('themes')} disabled={activeTab === 'themes'}>Themes</button>
      </nav>

      {activeTab !== 'sources' && (
        <div className="source-filter-section" style={{ marginBottom: '10px' }}>
          <label htmlFor="source-select">Filter by Source: </label>
          <select 
            id="source-select" 
            value={selectedSourceId || ''} 
            onChange={(e) => setSelectedSourceId(e.target.value || null)}
            // Populate this with actual sources later
          >
            <option value="">All Loaded Sources</option>
            {/* Example: <option value="src_id_1">Source Name 1</option> */}
          </select>
        </div>
      )}

      <div className="main-content-area" style={{ display: 'flex', gap: '20px', flexGrow: 1, overflow: 'hidden' }}>
        {renderListPane()}
        {renderDetailEditPane()}
      </div>

      <footer style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px', textAlign: 'center' }}>
        <p>SAEH Data Management Interface</p>
      </footer>
    </div>
  );
};

export default DataManagementPage;