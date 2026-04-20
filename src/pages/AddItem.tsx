import React, { useState } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import type { Item } from '../utils/types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { S } from '../styles/theme';

const AddItem: React.FC = () => {
  const [type, setType] = useState<'found' | 'lost'>('found');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      let imageData = '';

      // Only process image if one exists and has valid size (compress for faster upload)
      if (image && image.size < 5000000) { // 5MB limit
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                const compressedData = canvas.toDataURL('image/jpeg', 0.8);
                resolve(compressedData);
              } else {
                resolve(reader.result as string);
              }
            };
            img.src = reader.result as string;
          };
          reader.onerror = () => reject(new Error('Failed to read image'));
          reader.readAsDataURL(image);
        });
      }

      const keywords = description.toLowerCase().split(' ').filter(word => word.length > 2);

      const newItem = {
        type,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        phoneNumber: phoneNumber.trim(),
        imageData: imageData || null,
        keywords,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'items'), newItem);
      console.log('Item added with ID:', docRef.id);

      // Matching logic for lost items
      if (type === 'lost') {
        try {
          const foundItemsQuery = await getDocs(collection(db, 'items'));
          const foundItems = foundItemsQuery.docs
            .filter(doc => doc.data().type === 'found')
            .map(doc => ({ id: doc.id, ...doc.data() } as Item));

          const matches = foundItems.filter(foundItem =>
            (foundItem.keywords && foundItem.keywords.some(k => keywords.includes(k))) ||
            foundItem.location.toLowerCase().includes(location.toLowerCase())
          );

          if (matches.length > 0) {
            console.log('Matches found:', matches);
            alert(`✓ Item posted!\n\nPotential matches: ${matches.map(m => m.title).join(', ')}`);
          }
        } catch (matchErr) {
          console.log('Match check completed');
        }
      } else {
        alert('✓ Found item posted successfully!');
      }

      setUploading(false);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to post item');
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" } as React.CSSProperties}>
      <Navbar />

      <div style={{ flex: 1, padding: '32px 16px', width: '100%' }}>
        <div style={{ margin: '0 auto', maxWidth: 600 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Link to="/dashboard" style={{ color: '#e8533a', textDecoration: 'none', marginBottom: 16, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
              ← Back to Dashboard
            </Link>
            <h1 style={S.heroTitle as React.CSSProperties}>
              Report {type === 'found' ? 'Found' : 'Lost'} Item
            </h1>
            <p style={S.heroSub as React.CSSProperties}>Help reconnect items with their owners</p>
          </div>

          {/* Form Card */}
          <div style={S.modalBox as React.CSSProperties}>
            <form onSubmit={handleSubmit}>
              {/* Item Type Selection */}
              <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                <label style={S.label as React.CSSProperties}>Item Type *</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['found', 'lost'] as const).map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="radio"
                        value={t}
                        checked={type === t}
                        onChange={(e) => setType(e.target.value as 'found' | 'lost')}
                        style={{ marginRight: 8 }}
                      />
                      <span style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 8,
                        fontWeight: 500,
                        fontSize: 13,
                        background: type === t
                          ? (t === 'found' ? '#1a3a1a' : '#3a1a1a')
                          : '#1a1a1a',
                        color: type === t
                          ? (t === 'found' ? '#5acc6a' : '#e8533a')
                          : '#555',
                        border: '1px solid ' + (type === t ? (t === 'found' ? '#2a5a2a' : '#5a2a2a') : '#222'),
                      }}>
                        {t === 'found' ? '✓ Found' : '? Lost'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 24 }}>
                <label style={S.label as React.CSSProperties}>Photo</label>
                <div style={{
                  border: '2px dashed #333',
                  borderRadius: 8,
                  padding: 24,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="imageInput"
                  />
                  <label htmlFor="imageInput" style={{ cursor: 'pointer', display: 'block' }}>
                    {imagePreview ? (
                      <div>
                        <img src={imagePreview} alt="Preview" style={{ height: 120, margin: '0 auto 8px', borderRadius: 4 }} />
                        <p style={{ color: '#e8533a', fontSize: 12 }}>Click to change photo</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                        <p style={{ color: '#666', marginBottom: 4 }}>Click to upload or drag and drop</p>
                        <p style={{ fontSize: 11, color: '#444' }}>PNG, JPG up to 5MB (optional)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div style={S.formRow as React.CSSProperties}>
                <label style={S.label as React.CSSProperties}>Item Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Black Sony Backpack"
                  maxLength={100}
                  style={S.input as React.CSSProperties}
                />
              </div>

              {/* Description */}
              <div style={S.formRow as React.CSSProperties}>
                <label style={S.label as React.CSSProperties}>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item in detail (color, size, brand, features)"
                  rows={4}
                  maxLength={500}
                  style={{ ...S.input, resize: 'none', fontFamily: 'inherit' } as React.CSSProperties}
                />
                <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{description.length}/500 characters</p>
              </div>

              {/* Location and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div>
                  <label style={S.label as React.CSSProperties}>Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Library, Campus Gate"
                    style={S.input as React.CSSProperties}
                  />
                </div>
                <div>
                  <label style={S.label as React.CSSProperties}>Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={S.input as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div style={S.formRow as React.CSSProperties}>
                <label style={S.label as React.CSSProperties}>Contact Phone Number *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                  maxLength={20}
                  style={S.input as React.CSSProperties}
                />
              </div>

              {/* Error Message */}
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
                  style={{ ...S.btnPrimary, flex: 1, padding: '11px', fontSize: 14, opacity: uploading ? 0.5 : 1 } as React.CSSProperties}
                >
                  {uploading ? 'Posting...' : 'Post Item'}
                </button>
                <Link to="/dashboard" style={{ ...S.btnSecondary, padding: '11px 24px', textDecoration: 'none', fontSize: 14, display: 'inline-block' } as React.CSSProperties}>
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