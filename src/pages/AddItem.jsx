import React, { useState } from 'react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { S } from '../styles/theme';

const AddItem = () => {
  const [type, setType] = useState('found');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !date || !phoneNumber.trim()) {
      setError('Please fill in all required fields including phone number');
      return;
    }

    setUploading(true);

    try {
      const keywords = description.toLowerCase().split(' ').filter(word => word.length > 2);

      const newItem = {
        type,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        phoneNumber: phoneNumber.trim(),
        keywords,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      // Save to Firestore — no imageData so documents stay small and visible to all users
      await addDoc(collection(db, 'items'), newItem);

      // Navigate immediately — don't block on match-checking
      navigate('/dashboard');

      // Fire-and-forget match check so it never blocks navigation
      if (type === 'lost') {
        try {
          const topKeywords = keywords.slice(0, 10);
          const matchQuery = query(
            collection(db, 'items'),
            where('type', '==', 'found'),
            where('keywords', 'array-contains-any', topKeywords)
          );
          const matchSnapshot = await getDocs(matchQuery);
          if (!matchSnapshot.empty) {
            const matchTitles = matchSnapshot.docs.map(d => d.data().title).join(', ');
            alert(`✓ Item posted!\n\nPotential matches found: ${matchTitles}`);
          }
        } catch {
          // Match check failure should never affect the user flow
        }
      }
    } catch (err) {
      console.error('Error posting item:', err);
      setError(err.message || 'Failed to post item');
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Navbar />

      <div style={{ flex: 1, padding: '32px 16px', width: '100%' }}>
        <div style={{ margin: '0 auto', maxWidth: 600 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Link to="/dashboard" style={{ color: '#e8533a', textDecoration: 'none', marginBottom: 16, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
              ← Back to Dashboard
            </Link>
            <h1 style={S.heroTitle}>
              Report {type === 'found' ? 'Found' : 'Lost'} Item
            </h1>
            <p style={S.heroSub}>Help reconnect items with their owners</p>
          </div>

          {/* Form Card */}
          <div style={S.modalBox}>
            <form onSubmit={handleSubmit}>

              {/* Item Type */}
              <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                <label style={S.label}>Item Type *</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['found', 'lost'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="radio"
                        value={t}
                        checked={type === t}
                        onChange={(e) => setType(e.target.value)}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 13,
                        background: type === t ? (t === 'found' ? '#1a3a1a' : '#3a1a1a') : '#1a1a1a',
                        color: type === t ? (t === 'found' ? '#5acc6a' : '#e8533a') : '#555',
                        border: '1px solid ' + (type === t ? (t === 'found' ? '#2a5a2a' : '#5a2a2a') : '#222'),
                      }}>
                        {t === 'found' ? '✓ Found' : '? Lost'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={S.formRow}>
                <label style={S.label}>Item Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Black Sony Backpack"
                  maxLength={100}
                  style={S.input}
                />
              </div>

              {/* Description */}
              <div style={S.formRow}>
                <label style={S.label}>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item in detail (color, size, brand, features)"
                  rows={4}
                  maxLength={500}
                  style={{ ...S.input, resize: 'none', fontFamily: 'inherit' }}
                />
                <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{description.length}/500 characters</p>
              </div>

              {/* Location and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={S.label}>Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Library, Campus Gate"
                    style={S.input}
                  />
                </div>
                <div>
                  <label style={S.label}>Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={S.input}
                  />
                </div>
              </div>

              {/* Phone */}
              <div style={S.formRow}>
                <label style={S.label}>Contact Phone Number *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +91 98765 43210"
                  maxLength={20}
                  style={S.input}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#2a1818', border: '1px solid #3a2828', color: '#e8533a', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 16 }}>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ ...S.btnPrimary, flex: 1, padding: '11px', fontSize: 14, opacity: uploading ? 0.5 : 1 }}
                >
                  {uploading ? 'Posting...' : 'Post Item'}
                </button>
                <Link
                  to="/dashboard"
                  style={{ ...S.btnSecondary, padding: '11px 24px', textDecoration: 'none', fontSize: 14, display: 'inline-block' }}
                >
                  Cancel
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddItem;