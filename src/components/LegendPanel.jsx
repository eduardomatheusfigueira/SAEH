import React, { useState } from 'react';

const LegendSection = ({ title, items, initiallyOpen = true }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    fontSize: '0.9em',
  };

  const colorBoxStyle = (color, swatchStyleOverride) => ({
    width: '15px',
    height: '15px',
    backgroundColor: color || '#808080',
    marginRight: '8px',
    border: '1px solid #555',
    ...swatchStyleOverride,
  });

  return (
    <div style={{ marginBottom: '10px' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}
      >
        <h5 style={{ margin: 0, marginRight: '5px', fontWeight: 'bold' }}>
          {isOpen ? '▾' : '▸'} {title || 'Legenda'}
        </h5>
      </div>
      {isOpen && (
        <div style={{ paddingLeft: '10px' }}>
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} style={itemStyle} title={item.description || item.label}>
                <span style={colorBoxStyle(item.color, item.swatchStyle)}></span>
                {item.label}
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.85em', fontStyle: 'italic' }}>Nenhum item nesta seção.</p>
          )}
        </div>
      )}
    </div>
  );
};

const LegendPanel = ({ legendSections }) => {
  if (!legendSections || legendSections.length === 0) {
    return null;
  }

  const panelStyle = {
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginTop: '10px',
    maxHeight: '340px', // Increased again
    overflowY: 'auto',
  };

  return (
    <div style={panelStyle}>
      {legendSections.map((section) => (
        <LegendSection
          key={section.id || section.title} // Prefer unique ID if available
          title={section.title}
          items={section.items}
          initiallyOpen={section.initiallyOpen !== undefined ? section.initiallyOpen : true}
        />
      ))}
    </div>
  );
};

export default LegendPanel;