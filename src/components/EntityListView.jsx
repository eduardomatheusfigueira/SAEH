import React, { useState } from 'react';

const EntityListView = ({ characters, places, themes, sources, onEntityClick }) => {
  const [activeTab, setActiveTab] = useState('characters'); // 'characters', 'places', 'themes', 'sources'

  const renderList = (items, entityType) => {
    if (!items || items.length === 0) {
      let entityTypePortuguese = entityType;
      if (entityType === 'character') entityTypePortuguese = 'personagens';
      if (entityType === 'place') entityTypePortuguese = 'lugares';
      if (entityType === 'theme') entityTypePortuguese = 'temas';
      if (entityType === 'source') entityTypePortuguese = 'fontes';
      return <p><em>Nenhum(a) {entityTypePortuguese} carregado(a).</em></p>;
    }
    return (
      <ul style={{ listStyleType: 'none', paddingLeft: 0, maxHeight: '200px', overflowY: 'auto' }}>
        {items.map(item => (
          <li
            key={item.globalId || item.id} // Themes and Sources use item.id
            onClick={() => onEntityClick(entityType, item.globalId || item.id)}
            style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #eee' }}
            title={item.description_short || item.name}
          >
            {item.name}
            {entityType === 'theme' && item.color && (
              <span style={{ color: item.color, marginLeft: '5px', fontWeight: 'bold' }}>■</span>
            )}
             {entityType === 'source' && item.color && (
              <span style={{ color: item.color, marginLeft: '5px', fontWeight: 'bold' }}>■</span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="entity-list-view" style={{ marginTop: '15px' }}>
      <h4>Explorar Entidades</h4>
      <div className="tabs" style={{ marginBottom: '10px' }}>
        <button onClick={() => setActiveTab('characters')} disabled={activeTab === 'characters'}>Personagens</button>
        <button onClick={() => setActiveTab('places')} disabled={activeTab === 'places'} style={{ marginLeft: '5px' }}>Lugares</button>
        <button onClick={() => setActiveTab('themes')} disabled={activeTab === 'themes'} style={{ marginLeft: '5px' }}>Temas</button>
        <button onClick={() => setActiveTab('sources')} disabled={activeTab === 'sources'} style={{ marginLeft: '5px' }}>Fontes (Info)</button>
      </div>

      {activeTab === 'characters' && renderList(characters, 'character')}
      {activeTab === 'places' && renderList(places, 'place')}
      {activeTab === 'themes' && renderList(themes, 'theme')}
      {activeTab === 'sources' && renderList(sources, 'source')}
    </div>
  );
};

export default EntityListView;