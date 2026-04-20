import React from 'react';
import { S } from '../styles/theme';

const Footer: React.FC = () => {
  return (
    <footer style={S.footer as React.CSSProperties}>
      <p>&copy; 2026 Trace It. All rights reserved.</p>
    </footer>
  );
};

export default Footer;