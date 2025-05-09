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
        className="legend-section-title" // Added class
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', paddingBottom: '5px', marginBottom: '5px' }} // Removed borderBottom
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

  // panelStyle removed, will be handled by CSS class "legend-panel"

  return (
    <div className="legend-panel"> {/* Changed to className */}
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