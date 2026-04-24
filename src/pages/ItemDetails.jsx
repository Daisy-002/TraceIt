import React, { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { S } from '../styles/theme';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'items', id));
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!item || !window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'items', item.id));
      alert('✓ Item deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
      setDeleting(false);
    }
  };

  const handleContact = () => {
    if (item?.phoneNumber) {
      window.location.href = `tel:${item.phoneNumber}`;
    } else {
      setShowContact(true);
    }
  };

  if (loading) return (
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

  if (!item) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8' }}>
      <Navbar />
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😞</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Item Not Found</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>The item you're looking for doesn't exist.</p>
        <Link to="/dashboard" style={{ display: 'inline-block', background: '#e8533a', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
      <Footer />
    </div>
  );

  const isFound = item.type === 'found';
  const isOwner = user && user.uid === item.userId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 16px' }}>
        <Link to="/dashboard" style={{ color: '#e8533a', textDecoration: 'none', marginBottom: 24, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, marginTop: 24 }}>

          {/* Image placeholder — no imageData stored anymore */}
          <div>
            <div style={{
              borderRadius: 8,
              overflow: 'hidden',
              height: 320,
              background: isFound
                ? 'linear-gradient(135deg, #2a5a2a, #1a3a1a)'
                : 'linear-gradient(135deg, #5a2a2a, #3a1a1a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ fontSize: 64, opacity: 0.5 }}>📦</div>
            </div>
          </div>

          {/* Item Details */}
          <div>
            <div style={S.modalBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{item.title}</h1>
                  <div style={S.badge(isFound ? 'found' : 'lost')}>
                    {isFound ? '✓ Found Item' : '? Lost Item'}
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ background: 'transparent', border: '1px solid #3a2828', color: '#e8533a', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Description</h2>
                <p style={{ color: '#aaa', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{item.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #222' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>📍 Location</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{item.location}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>📅 Date</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>📞 Contact</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{item.phoneNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>🏷 Type</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{item.type}</p>
                </div>
              </div>

              {/* Contact button */}
              {showContact ? (
                <div style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Contact via phone</p>
                  <p style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{item.phoneNumber}</p>
                </div>
              ) : (
                <button
                  onClick={handleContact}
                  style={{ ...S.btnPrimary, width: '100%', padding: '12px', fontSize: 14, cursor: 'pointer' }}
                >
                  Contact Item Owner
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItemDetails;