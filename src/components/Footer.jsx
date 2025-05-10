import React from 'react';

const Footer = ({ currentUiTheme = {} }) => {
  const footerStyle = {
    padding: '5px 15px', // Adjusted padding for fixed position
    textAlign: 'right',  // Align text to the right
    fontSize: '0.85em', // Slightly smaller font
    backgroundColor: currentUiTheme['--panel-background'] || 'var(--panel-background, #f0f2f5)',
    color: currentUiTheme['--text-color-muted'] || 'var(--text-color-muted, #6c757d)',
    borderTop: '1px solid #cccccc', // Simplified to avoid parsing error
    position: 'fixed',
    bottom: 0,
    right: 0, // Position to the bottom right
    // width: '100%', // Not needed for right alignment of content
    // left: 0, // Not needed for right alignment
    zIndex: 1000, // Ensure it's above most content but below modals
  };

  return (
    <footer style={footerStyle}>
      Desenvolvido por Eduardo Matheus Figueira
    </footer>
  );
};

export default Footer;
