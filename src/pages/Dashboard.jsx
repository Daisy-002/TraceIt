import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { S } from '../styles/theme';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setError('');
        const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemsData);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        (item.keywords && item.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())));
      const matchesFilter = filter === 'all' || item.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  if (loading) return (
    <>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .spinner { animation: spin 1s linear infinite; }
        `}</style>
        <div className="spinner" style={{ fontSize: 32 }}>⏳</div>
        <p style={{ fontSize: 14, color: '#666' }}>Loading items...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: '#e8533a', fontSize: 14, marginBottom: 20 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ ...S.btnPrimary, cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Navbar />

      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 16px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.6px', margin: '0 0 6px', color: '#f0ede8' }}>
            Browse Lost & Found Items
          </h1>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            Find your missing items or help others reunite with theirs
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8, fontWeight: 500 }}>Search</label>
              <input
                type="text"
                placeholder="Search by item name, description, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: '#0f0f0f', border: '1px solid #222', color: '#f0ede8', padding: '10px 12px', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8, fontWeight: 500 }}>Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: '100%', background: '#0f0f0f', border: '1px solid #222', color: '#999', padding: '10px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">All Items</option>
                <option value="found">Found Items</option>
                <option value="lost">Lost Items</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: '#555' }}>{filteredItems.length} items found</p>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, marginTop: 32, marginBottom: 32 }}>
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div style={{ ...S.emptyState, marginTop: 32, marginBottom: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No items found</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Try adjusting your search or filter</p>
            <Link to="/add-item" style={{ display: 'inline-block', ...S.btnPrimary, textDecoration: 'none' }}>
              Post an Item
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;