import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { S } from '../styles/theme';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav style={S.navbar}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <div style={S.logo}>
          <div style={S.logoDot} />
          Trace It
        </div>
      </Link>

      {user && (
        <div style={S.navActions}>
          <span style={{ fontSize: 12, color: '#888' }}>{user.email}</span>
          <Link to="/add-item" style={{ textDecoration: 'none' }}>
            <button style={S.btnPrimary}>+ Post Item</button>
          </Link>
          <button style={S.btnGhost} onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;