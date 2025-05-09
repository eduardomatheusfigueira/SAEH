import React from 'react';

const DetailModal = ({ entityData, entityType, onClose }) => {
  if (!entityData) {
    return null; // Don't render if no data
  }

  // Simple rendering of properties for now
  // We'll enhance this to handle article_full (Markdown) and specific fields later
  const renderEntityDetails = () => {
    if (!entityData) return <p>Nenhum dado disponível.</p>;

    // Common fields
    let details = (
      <div>
        <h2>{entityData.title || entityData.name || `Detalhes de ${entityType}`}</h2>
        {entityData.description_short && <p><strong>Descrição Curta:</strong> {entityData.description_short}</p>}
        {entityData.id && <p><small>ID: {entityData.globalId || entityData.id}</small></p>}
      </div>
    );

    // Type-specific fields (very basic for now)
    if (entityType === 'event') {
      details = (
        <div>
          {details}
          {entityData.start_date && <p><strong>Data Início:</strong> {entityData.start_date}</p>}
          {entityData.end_date && <p><strong>Data Fim:</strong> {entityData.end_date}</p>}
          {/* Add more event-specific fields */}
        </div>
      );
    } else if (entityType === 'character') {
      // Add character-specific fields
    } else if (entityType === 'place') {
      // Add place-specific fields
    } else if (entityType === 'theme') {
      details = (
        <div>
          {details}
          {entityData.color && <p><strong>Cor:</strong> <span style={{ color: entityData.color }}>■</span> {entityData.color}</p>}
        </div>
      );
    } else if (entityType === 'source') {
       details = ( // For source_info objects
        <div>
          <h2>Fonte: {entityData.name}</h2>
          {entityData.description_short && <p><strong>Descrição Curta:</strong> {entityData.description_short}</p>}
          {entityData.id && <p><small>ID: {entityData.id}</small></p>}
          {entityData.color && <p><strong>Cor:</strong> <span style={{ color: entityData.color }}>■</span> {entityData.color}</p>}
        </div>
      );
    }

    // Placeholder for article_full
    if (entityData.article_full && entityData.article_full.current) {
      details = (
        <div>
          {details}
          <h4 style={{ marginTop: '15px' }}>Artigo Completo:</h4>
          <div style={{ border: '1px solid #eee', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            {/* Markdown rendering will go here */}
            <pre>{entityData.article_full.current}</pre>
          </div>
        </div>
      );
    } else if (entityData.description_short === undefined && (!entityData.article_full || !entityData.article_full.current)) {
        details = <div>{details} <p>Ainda sem maiores detalhes.</p></div>;
    }


    return details;
  };

  return (
    <div className="modal-content-placeholder"> {/* Use class from App.css for styling */}
      {renderEntityDetails()}
      <button onClick={onClose} style={{ marginTop: '20px' }}>Fechar</button>
    </div>
  );
};

export default DetailModal;