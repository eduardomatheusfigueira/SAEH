import React from 'react';

const Footer = ({ currentUiTheme = {} }) => {
  const footerStyle = {
    padding: '0 15px', // Vertical padding handled by height + alignItems
    // textAlign: 'right', // Not needed if using flexbox for alignment
    fontSize: '0.85em',
    backgroundColor: currentUiTheme['--panel-background'] || 'var(--panel-background, #f0f2f5)',
    color: currentUiTheme['--text-color-muted'] || 'var(--text-color-muted, #6c757d)',
    borderTop: '1px solid #cccccc',
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '35px', // Explicit height for the footer bar
    zIndex: 1000,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center', // Vertically center the text
    justifyContent: 'flex-end', // Horizontally align text to the right
  };

  return (
    <footer style={footerStyle}>
      <span>© 2025 Sistema de Auxílio ao Estudo Histórico por Eduardo Matheus Figueira</span>
    </footer>
  );
};

export default Footer;
