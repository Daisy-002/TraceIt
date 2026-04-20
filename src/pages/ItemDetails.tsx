import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import type { Item } from '../utils/types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { S } from '../styles/theme';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      if (id) {
        try {
          const docRef = doc(db, 'items', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const fetchedItem = { id: docSnap.id, ...docSnap.data() } as Item;
            setItem(fetchedItem);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'items', item.id));
      alert('✓ Item deleted successfully');
      navigate('/dashboard');
    } catch (err: any) {
      alert('Failed to delete item: ' + err.message);
      setDeleting(false);
    }
  };

  const handleContactOwner = () => {
    // Use phone number if available
    if (item?.phoneNumber) {
      window.location.href = `tel:${item.phoneNumber}`;
    } else {
      setShowContactModal(true);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#555' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <p>Loading item details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" } as React.CSSProperties}>
        <Navbar />
        <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😞</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Item Not Found</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>The item you're looking for doesn't exist.</p>
          <Link to="/dashboard" style={{ display: 'inline-block', background: '#e8533a', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' } as React.CSSProperties}>
            Back to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isFound = item.type === 'found';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" } as React.CSSProperties}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 16px' }}>
        <Link to="/dashboard" style={{ color: '#e8533a', textDecoration: 'none', marginBottom: 24, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32 }}>
          {/* Image Section */}
          <div>
            <div style={{
              borderRadius: 8,
              overflow: 'hidden',
              height: 320,
              background: isFound ? 'linear-gradient(135deg, #2a5a2a, #1a3a1a)' : 'linear-gradient(135deg, #5a2a2a, #3a1a1a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.imageData ? (
                <img src={item.imageData} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: 64, opacity: 0.5 }}>📦</div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div style={S.modalBox as React.CSSProperties}>
              {/* Header with Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{item.title}</h1>
                  <div style={S.badge(isFound ? 'found' : 'lost')}>
                    {isFound ? '✓ Found Item' : '? Lost Item'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Description</h2>
                <p style={{ color: '#aaa', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.description}</p>
              </div>

              {/* Key Information */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #222' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>📍 Location</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{item.location}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>📅 Date</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>� Contact</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{item.phoneNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>🕐 Posted</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              {item.keywords.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 12 }}>Keywords</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {item.keywords.map((keyword, idx) => (
                      <span key={idx} style={S.metaChip}>
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button 
                  onClick={handleContactOwner}
                  style={{ flex: 1, ...S.btnPrimary, padding: '16px', fontSize: 16, fontWeight: 600 } as React.CSSProperties}
                >
                  ☎️ Call Owner
                </button>
                {user && item && user.uid === item.userId && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      background: '#8B0000',
                      color: '#fff',
                      border: 'none',
                      padding: '16px 24px',
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.5 : 1,
                      transition: 'opacity .15s'
                    }}
                  >
                    {deleting ? '🗑️ Deleting...' : '🗑️ Delete'}
                  </button>
                )}
              </div>

              {/* Contact Modal */}
              {showContactModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 200,
                  padding: 20
                }}>
                  <div style={{
                    background: '#141414',
                    border: '1px solid #222',
                    borderRadius: 16,
                    padding: 32,
                    maxWidth: 400,
                    textAlign: 'center'
                  }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Contact Item Owner</h2>
                    <p style={{ color: '#aaa', marginBottom: 24 }}>
                      Owner's phone: <strong style={{ color: '#e8533a', fontSize: 16 }}>{item?.phoneNumber}</strong>
                    </p>
                    <button
                      onClick={() => setShowContactModal(false)}
                      style={{ ...S.btnPrimary, padding: '10px 20px' } as React.CSSProperties}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div style={{ marginTop: 24, background: '#1a3a1a', border: '1px solid #2a5a2a', borderRadius: 8, padding: 16 }}>
                <p style={{ fontSize: 12, color: '#5acc6a' }}>
                  💡 <span style={{ fontWeight: 600 }}>Tip:</span> Contact the owner through this link to discuss the item details and arrange a pickup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItemDetails;